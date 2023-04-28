import confetti from "canvas-confetti"
import { Trans, useTranslation } from "next-i18next"
import { useEffect, useMemo, useRef, useState } from "react"

import { CharacterList } from "~/components/common/CharacterList"
import { Modal } from "~/components/ui/Modal"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { CSB_SCAN } from "~/lib/env"
import { cn } from "~/lib/utils"
import { parsePageId } from "~/models/page.model"
import {
  useCheckLike,
  useGetLikeCounts,
  useGetLikes,
  useToggleLikePage,
} from "~/queries/page"

import { AvatarStack } from "../ui/AvatarStack"
import { Button } from "../ui/Button"

export const ReactionLike: React.FC<{
  size?: "sm" | "base"
  pageId?: string
}> = ({ size, pageId }) => {
  const toggleLikePage = useToggleLikePage()
  const { t } = useTranslation("common")

  const [isLikeOpen, setIsLikeOpen] = useState(false)
  const [isLikeListOpen, setIsLikeListOpen] = useState(false)
  const likeRef = useRef<HTMLButtonElement>(null)

  const [likes, likesMutation] = useGetLikes({ pageId })
  const [likeStatus] = useCheckLike({
    pageId,
  })
  const { data: likeCount = 0 } = useGetLikeCounts({ pageId })

  const [isUnlikeOpen, setIsUnlikeOpen] = useState(false)

  const like = () => {
    if (pageId) {
      if (likeStatus.isLiked) {
        setIsLikeOpen(true)
      } else {
        toggleLikePage.mutate({ ...parsePageId(pageId), action: "link" })
      }
    }
  }

  const unlike = () => {
    if (pageId) {
      setIsUnlikeOpen(false)
      if (likeStatus.isLiked) {
        toggleLikePage.mutate({ ...parsePageId(pageId), action: "unlink" })
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
        })),
    [likes],
  )
  return (
    <>
      <div className={cn("xlog-reactions-like flex items-center sm:mb-0")}>
        <Button
          variant="like"
          className={`flex items-center mr-2 ${likeStatus.isLiked && "active"}`}
          isAutoWidth={true}
          onClick={like}
          isLoading={toggleLikePage.isPending}
          ref={likeRef}
        >
          {(() => {
            const inner = (
              <span
                className={cn(
                  "i-mingcute:thumb-up-2-fill mr-1",
                  size === "sm" ? "text-base" : "text-[38px]",
                )}
              ></span>
            )
            return size !== "sm" ? (
              <Tooltip label={t("Like")} placement="top">
                {inner}
              </Tooltip>
            ) : (
              inner
            )
          })()}
          <span>{likeCount}</span>
        </Button>
        {size !== "sm" && (
          <AvatarStack
            avatars={avatars}
            count={likeCount}
            onClick={() => setIsLikeListOpen(true)}
          />
        )}
      </div>
      <Modal
        open={isLikeOpen}
        setOpen={setIsLikeOpen}
        title={t("Like successfully") || ""}
      >
        <div className="p-5">
          <Trans i18nKey="like stored">
            Your like has been stored on the blockchain, view it on{" "}
            <UniLink
              className="text-accent"
              href={`${CSB_SCAN}/tx/${likeStatus.transactionHash}`}
            >
              Crossbell Scan
            </UniLink>
          </Trans>
        </div>
        <div className="border-t flex flex-col md:flex-row gap-4 items-center px-5 py-4">
          <Button isBlock onClick={() => setIsLikeOpen(false)}>
            {t("Got it, thanks!")}
          </Button>
          <Button
            variant="secondary"
            isBlock
            onClick={() => {
              setIsUnlikeOpen(true)
              setIsLikeOpen(false)
            }}
          >
            {t("Revert")}
          </Button>
        </div>
      </Modal>
      <Modal
        open={isUnlikeOpen}
        setOpen={setIsUnlikeOpen}
        title={t("Confirm to revert")}
      >
        <div className="p-5">
          <Trans i18nKey="like revert">
            Do you really want to revert this like action?
          </Trans>
        </div>
        <div className="border-t flex flex-col md:flex-row gap-4 items-center px-5 py-4">
          <Button isBlock onClick={() => setIsUnlikeOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button variant="secondary" isBlock onClick={() => unlike()}>
            {t("Confirm")}
          </Button>
        </div>
      </Modal>
      <CharacterList
        open={isLikeListOpen}
        setOpen={setIsLikeListOpen}
        title={t("Like List")}
        loadMore={likesMutation.fetchNextPage}
        hasMore={!!likesMutation.hasNextPage}
        list={likesMutation.data?.pages || []}
      ></CharacterList>
    </>
  )
}
