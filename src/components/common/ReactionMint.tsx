import confetti from "canvas-confetti"
import { Trans, useTranslation } from "next-i18next"
import { useEffect, useMemo, useRef, useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { CharacterList } from "~/components/common/CharacterList"
import { MintIcon } from "~/components/icons/MintIcon"
import { Modal } from "~/components/ui/Modal"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { CSB_SCAN, CSB_XCHAR } from "~/lib/env"
import { noopArr } from "~/lib/noop"
import { cn } from "~/lib/utils"
import { parsePageId } from "~/models/page.model"
import { useCheckMint, useGetMints, useMintPage } from "~/queries/page"

import { AvatarStack } from "../ui/AvatarStack"
import { Button } from "../ui/Button"

export const ReactionMint: React.FC<{
  size?: "sm" | "base"
  pageId?: string
}> = ({ size, pageId }) => {
  const mintPage = useMintPage()
  const { t } = useTranslation("common")

  const account = useAccountState((s) => s.computed.account)

  const [isMintOpen, setIsMintOpen] = useState(false)
  const [isMintListOpen, setIsMintListOpen] = useState(false)
  const mintRef = useRef<HTMLButtonElement>(null)

  const mints = useGetMints({
    pageId: pageId,
    includeCharacter: size !== "sm",
  })
  const isMint = useCheckMint(pageId)

  const mint = () => {
    if (pageId) {
      if (isMint.data?.count) {
        setIsMintOpen(true)
      } else {
        mintPage.mutate(parsePageId(pageId))
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
        })) || noopArr,
    [mints],
  )

  return (
    <>
      <div className="xlog-reactions-mint flex items-center">
        <Button
          variant="collect"
          className={`flex items-center mr-2 ${
            isMint.isSuccess && isMint.data.count && "active"
          }`}
          isAutoWidth={true}
          onClick={mint}
          isLoading={mintPage.isLoading}
          ref={mintRef}
        >
          {(() => {
            const inner = (
              <MintIcon className={cn(size === "sm" ? "w-3 h-3" : "w-8 h-8")} />
            )
            return size !== "sm" ? (
              <Tooltip label={t("Mint to an NFT")} placement="top">
                {inner}
              </Tooltip>
            ) : (
              inner
            )
          })()}
          <span className="ml-2">{mints.data?.pages?.[0]?.count || 0}</span>
        </Button>
        {size !== "sm" && (
          <AvatarStack
            avatars={avatars}
            onClick={() => setIsMintListOpen(true)}
            count={mints.data?.pages?.[0]?.count || 0}
          />
        )}
      </div>
      <Modal
        open={isMintOpen}
        setOpen={setIsMintOpen}
        title={t("Mint successfully") || ""}
      >
        <div className="p-5">
          <Trans i18nKey="mint stored">
            This post has been minted to NFT by you, view it on{" "}
            <UniLink
              className="text-accent"
              href={`${CSB_XCHAR}/${account?.character?.handle}/collections`}
            >
              xChar
            </UniLink>{" "}
            or{" "}
            <UniLink
              className="text-accent"
              href={`${CSB_SCAN}/tx/${isMint.data?.list?.[0]?.transactionHash}`}
            >
              Crossbell Scan
            </UniLink>
          </Trans>
        </div>
        <div className="h-16 border-t flex items-center px-5">
          <Button isBlock onClick={() => setIsMintOpen(false)}>
            {t("Got it, thanks!")}
          </Button>
        </div>
      </Modal>
      <CharacterList
        open={isMintListOpen}
        setOpen={setIsMintListOpen}
        title={t("Mint List")}
        loadMore={mints.fetchNextPage}
        hasMore={!!mints.hasNextPage}
        list={mints.data?.pages || []}
      ></CharacterList>
    </>
  )
}
