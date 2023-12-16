"use client"

import { useTranslations } from "next-intl"
import { useMemo, useRef } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { usePatronModal } from "~/components/common/PatronModal"
import { Tooltip } from "~/components/ui/Tooltip"
import { noopArr } from "~/lib/noop"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetTips } from "~/queries/site"

import { AvatarStack } from "../ui/AvatarStack"
import { Button } from "../ui/Button"

export const ReactionTip = ({
  characterId,
  noteId,
  site,
  page,
  vertical,
}: {
  characterId?: number
  noteId?: number
  site?: ExpandedCharacter
  page?: ExpandedNote
  vertical?: boolean
}) => {
  const t = useTranslations()

  const account = useAccountState((s) => s.computed.account)

  const tipRef = useRef<HTMLButtonElement>(null)

  const tips = useGetTips({
    toCharacterId: characterId,
    toNoteId: noteId,
  })
  const isTip = useGetTips({
    toCharacterId: characterId,
    toNoteId: noteId,
    characterId: account?.characterId || "0",
  })

  const presentPatronModal = usePatronModal()

  const tip = () => {
    if (characterId && noteId) {
      presentPatronModal(site, page)
    }
  }

  const showAvatarStack = !vertical

  const avatars = useMemo(
    () =>
      tips.data?.pages?.[0]?.list
        ?.sort((a, b) =>
          b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
        )
        .slice(0, 3)
        .map((mint) => ({
          images: mint.character?.metadata?.content?.avatars,
          name: mint.character?.metadata?.content?.name,
          cid: mint.character?.characterId,
        })) || noopArr,
    [tips.data?.pages],
  )

  return (
    <>
      <div className="xlog-reactions-tip flex items-center">
        <Button
          variant="tip"
          variantColor={vertical ? "light" : undefined}
          className={cn(
            "flex items-center",
            {
              active: isTip.isSuccess && isTip.data.pages?.[0].count,
            },
            vertical ? "!h-auto flex-col" : "mr-2",
          )}
          isAutoWidth={true}
          onClick={tip}
          ref={tipRef}
        >
          {(() => {
            const inner = (
              <i
                className={cn(
                  "i-mingcute-heart-fill",
                  vertical ? "text-[33px]" : "text-[38px]",
                )}
              />
            )
            return (
              <Tooltip label={t("Tip")} placement={vertical ? "right" : "top"}>
                {inner}
              </Tooltip>
            )
          })()}
          <span className={cn("leading-snug", vertical ? "" : "ml-2")}>
            {!tips.isLoading ? tips.data?.pages?.[0]?.count || 0 : "-"}
          </span>
        </Button>
        {showAvatarStack && (
          <AvatarStack
            avatars={avatars}
            count={tips.data?.pages?.[0]?.count || 0}
            onClick={tip}
          />
        )}
      </div>
    </>
  )
}
