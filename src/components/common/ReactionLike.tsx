"use client"

import confetti from "canvas-confetti"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"

import { CharacterList } from "~/components/common/CharacterList"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { CSB_SCAN } from "~/lib/env"
import { cn } from "~/lib/utils"
import {
  useCheckLike,
  useGetLikeCounts,
  useGetLikes,
  useToggleLikePage,
} from "~/queries/page"

import { AvatarStack } from "../ui/AvatarStack"
import { Button } from "../ui/Button"
import { ModalContentProps, useModalStack } from "../ui/ModalStack"

export const ReactionLike = ({
  size,
  characterId,
  noteId,
  vertical,
}: {
  size?: "sm" | "base"
  characterId?: number
  noteId?: number
  vertical?: boolean
}) => {
  const toggleLikePage = useToggleLikePage()
  const t = useTranslations()

  const [isLikeListOpen, setIsLikeListOpen] = useState(false)
  const likeRef = useRef<HTMLButtonElement>(null)

  const [likes, likesMutation] = useGetLikes({
    characterId,
    noteId,
  })
  const [likeStatus] = useCheckLike({
    characterId,
    noteId,
  })
  const likeCounts = useGetLikeCounts({
    characterId,
    noteId,
  })

  const { present } = useModalStack()

  const presentUnlikeModal = () => {
    if (characterId && noteId) {
      present({
        title: t("Confirm to revert"),
        content: (props) => (
          <UnLikeModal
            {...props}
            characterId={characterId}
            noteId={noteId}
            likeStatus={likeStatus}
            toggleLikePage={toggleLikePage}
          />
        ),
      })
    }
  }
  const like = () => {
    if (characterId && noteId) {
      if (likeStatus.isLiked) {
        present({
          title: t("Like successfully") || "",
          content: (props) => (
            <LikeModal
              {...props}
              likeStatus={likeStatus}
              presentUnlikeModal={presentUnlikeModal}
            />
          ),
        })
      } else {
        toggleLikePage.mutate({
          characterId,
          noteId,
          action: "link",
        })
      }
    }
  }

  const unlike = () => {
    if (characterId && noteId) {
      presentUnlikeModal()
      if (likeStatus.isLiked) {
        toggleLikePage.mutate({
          noteId,
          characterId,
          action: "unlink",
        })
      } // else do nothing
    }
  }

  useEffect(() => {
    if (toggleLikePage.isSuccess) {
      if (likeRef.current?.getBoundingClientRect() && likeStatus.isLiked) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: {
            x:
              (likeRef.current.getBoundingClientRect().left +
                likeRef.current.getBoundingClientRect().width / 2 || 0.5) /
              window.innerWidth,
            y:
              (likeRef.current.getBoundingClientRect().top || 0.5) /
              window.innerHeight,
          },
        })
      }
    }
  }, [toggleLikePage.isSuccess])

  const showAvatarStack = size !== "sm" && !vertical

  const avatars = useMemo(
    () =>
      likes
        ?.sort((a, b) =>
          b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
        )
        .slice(0, 3)
        .map(($) => ({
          images: $.character?.metadata?.content?.avatars,
          name: $.character?.metadata?.content?.name,
          cid: $.characterId,
        })),
    [likes],
  )
  return (
    <>
      <div className={cn("xlog-reactions-like flex items-center sm:mb-0")}>
        <Button
          variant="like"
          variantColor={vertical ? "light" : undefined}
          className={cn(
            "flex items-center",
            {
              active: likeStatus.isLiked,
            },
            vertical ? "!h-auto flex-col" : "mr-2",
          )}
          isAutoWidth={true}
          onClick={like}
          isLoading={toggleLikePage.isPending}
          ref={likeRef}
        >
          {(() => {
            const inner = (
              <i
                className={cn(
                  "i-mingcute-thumb-up-2-fill",
                  size === "sm"
                    ? "text-base"
                    : vertical
                      ? "text-[33px]"
                      : "text-[38px]",
                  !vertical && "mr-1",
                )}
              ></i>
            )
            return size !== "sm" ? (
              <Tooltip label={t("Like")} placement={vertical ? "right" : "top"}>
                {inner}
              </Tooltip>
            ) : (
              inner
            )
          })()}
          <span className="leading-snug">
            {!likeCounts.isLoading ? likeCounts.data : "-"}
          </span>
        </Button>
        {showAvatarStack && (
          <AvatarStack
            avatars={avatars}
            count={likeCounts.data || 0}
            onClick={() => setIsLikeListOpen(true)}
          />
        )}
      </div>

      {showAvatarStack && (
        <CharacterList
          open={isLikeListOpen}
          setOpen={setIsLikeListOpen}
          title={t("Like List")}
          loadMore={likesMutation.fetchNextPage}
          hasMore={!!likesMutation.hasNextPage}
          list={likesMutation.data?.pages || []}
        ></CharacterList>
      )}
    </>
  )
}

const LikeModal = ({
  dismiss,
  likeStatus,

  presentUnlikeModal,
}: ModalContentProps<{
  likeStatus: any

  presentUnlikeModal: () => void
}>) => {
  const t = useTranslations()

  return (
    <>
      <div className="p-5">
        {t.rich("like stored", {
          link: (chunks) => (
            <UniLink
              className="text-accent"
              href={`${CSB_SCAN}/tx/${likeStatus.transactionHash}`}
            >
              {chunks}
            </UniLink>
          ),
        })}
      </div>
      <div className="border-t flex flex-col md:flex-row gap-4 items-center px-5 py-4">
        <Button isBlock onClick={dismiss}>
          {t("Got it, thanks!")}
        </Button>
        <Button
          variant="secondary"
          isBlock
          onClick={() => {
            presentUnlikeModal()
            dismiss()
          }}
        >
          {t("Revert")}
        </Button>
      </div>
    </>
  )
}

const UnLikeModal = ({
  dismiss,
  characterId,
  noteId,
  likeStatus,
  toggleLikePage,
}: ModalContentProps<{
  characterId: number
  noteId: number
  likeStatus: any
  toggleLikePage: ReturnType<typeof useToggleLikePage>
}>) => {
  const t = useTranslations()

  const unlike = () => {
    if (characterId && noteId) {
      dismiss()
      if (likeStatus.isLiked) {
        toggleLikePage.mutate({
          noteId,
          characterId,
          action: "unlink",
        })
      } // else do nothing
    }
  }

  return (
    <>
      <div className="p-5">{t("like revert")}</div>
      <div className="border-t flex flex-col md:flex-row gap-4 items-center px-5 py-4">
        <Button isBlock onClick={dismiss}>
          {t("Cancel")}
        </Button>
        <Button variant="secondary" isBlock onClick={() => unlike()}>
          {t("Confirm")}
        </Button>
      </div>
    </>
  )
}
