"use client"

import confetti from "canvas-confetti"
import { useTranslations } from "next-intl"
import { FC, useEffect, useMemo, useRef, useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { CharacterList } from "~/components/common/CharacterList"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { CSB_SCAN, CSB_XCHAR } from "~/lib/env"
import { noopArr } from "~/lib/noop"
import { cn } from "~/lib/utils"
import { useCheckMint, useGetMints, useMintPage } from "~/queries/page"

import { AvatarStack } from "../ui/AvatarStack"
import { Button } from "../ui/Button"
import { ModalContentProps, useModalStack } from "../ui/ModalStack"

export const ReactionMint = ({
  size,
  noteId,
  characterId,
  vertical,
}: {
  size?: "sm" | "base"
  noteId?: number
  characterId?: number
  vertical?: boolean
}) => {
  const mintPage = useMintPage()
  const t = useTranslations()

  const account = useAccountState((s) => s.computed.account)

  const [isMintListOpen, setIsMintListOpen] = useState(false)
  const mintRef = useRef<HTMLButtonElement>(null)

  const mints = useGetMints({
    characterId,
    noteId,
    includeCharacter: size !== "sm",
  })
  const isMint = useCheckMint({
    characterId,
    noteId,
  })
  const presentMintModal = usePresentMintModal({
    handle: account?.character?.handle || "",
    transactionHash: isMint.data?.list?.[0]?.transactionHash || "",
  })
  const mint = () => {
    if (characterId && noteId) {
      if (isMint.data?.count) {
        presentMintModal()
      } else {
        mintPage.mutate({
          characterId,
          noteId,
        })
      }
    }
  }

  useEffect(() => {
    if (mintPage.isSuccess) {
      if (mintRef.current?.getBoundingClientRect()) {
        confetti({
          particleCount: 150,
          spread: 360,
          ticks: 50,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          origin: {
            x:
              (mintRef.current.getBoundingClientRect().left +
                mintRef.current.getBoundingClientRect().width / 2 || 0.5) /
              window.innerWidth,
            y:
              (mintRef.current.getBoundingClientRect().top || 0.5) /
              window.innerHeight,
          },
          shapes: ["star"],
          // cspell:disable-next-line
          colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
        })
      }
    }
  }, [mintPage.isSuccess])

  const showAvatarStack = size !== "sm" && !vertical

  const avatars = useMemo(
    () =>
      mints.data?.pages?.[0]?.list
        ?.sort((a, b) =>
          b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
        )
        .slice(0, 3)
        .map((mint) => ({
          images: mint.character?.metadata?.content?.avatars,
          name: mint.character?.metadata?.content?.name,
          cid: mint.character.characterId,
        })) || noopArr,
    [mints],
  )

  return (
    <>
      <div className="xlog-reactions-mint flex items-center">
        <Button
          variant="collect"
          variantColor={vertical ? "light" : undefined}
          className={cn(
            "flex items-center",
            {
              active: isMint.isSuccess && isMint.data.count,
            },
            vertical ? "!h-auto flex-col" : "mr-2",
          )}
          isAutoWidth={true}
          onClick={mint}
          isLoading={mintPage.isLoading}
          ref={mintRef}
        >
          {(() => {
            const inner = (
              <i
                className={cn(
                  "i-mingcute-magic-1-fill",
                  size === "sm"
                    ? "text-base"
                    : vertical
                      ? "text-[33px]"
                      : "text-[38px]",
                )}
              ></i>
            )
            return size !== "sm" ? (
              <Tooltip
                label={t("Mint to an NFT")}
                placement={vertical ? "right" : "top"}
              >
                {inner}
              </Tooltip>
            ) : (
              inner
            )
          })()}
          <span className={cn("leading-snug", vertical ? "" : "ml-2")}>
            {!mints.isLoading ? mints.data?.pages?.[0]?.count || 0 : "-"}
          </span>
        </Button>
        {showAvatarStack && (
          <AvatarStack
            avatars={avatars}
            onClick={() => setIsMintListOpen(true)}
            count={mints.data?.pages?.[0]?.count || 0}
          />
        )}
      </div>

      {showAvatarStack && (
        <CharacterList
          open={isMintListOpen}
          setOpen={setIsMintListOpen}
          title={t("Mint List")}
          loadMore={mints.fetchNextPage}
          hasMore={!!mints.hasNextPage}
          list={mints.data?.pages || []}
        ></CharacterList>
      )}
    </>
  )
}

const usePresentMintModal = (props: MintModalProps) => {
  const { present } = useModalStack()
  const t = useTranslations()
  return () => {
    present({
      title: t("Mint successfully") || "",
      content: (rest) => <MintModal {...rest} {...props} />,
    })
  }
}

interface MintModalProps {
  handle: string
  transactionHash: string
}

const MintModal: FC<ModalContentProps<MintModalProps>> = ({
  handle,
  dismiss,
  transactionHash,
}) => {
  const t = useTranslations()

  return (
    <div>
      <div className="p-5">
        {t.rich("mint stored", {
          link1: (chunks) => (
            <UniLink
              className="text-accent"
              href={`${CSB_XCHAR}/${handle}/collections`}
            >
              {chunks}
            </UniLink>
          ),
          link2: (chunks) => (
            <UniLink
              className="text-accent"
              href={`${CSB_SCAN}/tx/${transactionHash}`}
            >
              Crossbell Scan
            </UniLink>
          ),
        })}
      </div>
      <div className="h-16 border-t flex items-center px-5">
        <Button isBlock onClick={dismiss}>
          {t("Got it, thanks!")}
        </Button>
      </div>
    </div>
  )
}
