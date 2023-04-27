import { useTranslation } from "next-i18next"
import { useRef, useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { PatronModal } from "~/components/common/PatronModal"
import { Tooltip } from "~/components/ui/Tooltip"
import { Note, Profile } from "~/lib/types"
import { parsePageId } from "~/models/page.model"
import { useGetTips } from "~/queries/site"

import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"

export const ReactionTip: React.FC<{
  pageId?: string
  site?: Profile | null
  page?: Note | null
}> = ({ pageId, site, page }) => {
  const { t } = useTranslation("common")

  const account = useAccountState((s) => s.computed.account)

  const [isTipOpen, setIsTipOpen] = useState(false)
  const tipRef = useRef<HTMLButtonElement>(null)

  const { characterId, noteId } = parsePageId(pageId || "")
  const tips = useGetTips({
    toCharacterId: characterId,
    toNoteId: noteId,
  })
  const isTip = useGetTips({
    toCharacterId: characterId,
    toNoteId: noteId,
    characterId: account?.characterId || "0",
  })

  const tip = () => {
    if (pageId) {
      setIsTipOpen(true)
    }
  }

  return (
    <>
      <div className="xlog-reactions-tip flex items-center">
        <Button
          variant="tip"
          className={`flex items-center mr-2 ${
            isTip.isSuccess && isTip.data.pages?.[0].count && "active"
          }`}
          isAutoWidth={true}
          onClick={tip}
          ref={tipRef}
        >
          {(() => {
            const inner = <i className="i-mingcute:heart-fill text-[40px]" />
            return (
              <Tooltip label={t("Tip")} placement="top">
                {inner}
              </Tooltip>
            )
          })()}
          <span className="ml-2">{tips.data?.pages?.[0]?.count || 0}</span>
        </Button>
        {
          <ul
            className="-space-x-4 cursor-pointer hidden sm:inline-block"
            onClick={tip}
          >
            {tips.data?.pages?.[0]?.list
              ?.sort((a, b: any) =>
                b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
              )
              .slice(0, 3)
              .map((tip: any, index) => (
                <li className="inline-block" key={index}>
                  <Avatar
                    className="relative align-middle border-2 border-white"
                    images={tip.character?.metadata?.content?.avatars || []}
                    name={tip.character?.metadata?.content?.name}
                    size={40}
                  />
                </li>
              ))}
            {(tips.data?.pages?.[0]?.count || 0) > 3 && (
              <li className="inline-block">
                <div className="relative align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                  +{tips.data!.pages?.[0]?.count - 3}
                </div>
              </li>
            )}
          </ul>
        }
      </div>
      <PatronModal
        site={site}
        open={isTipOpen}
        setOpen={setIsTipOpen}
        page={page}
      />
    </>
  )
}
