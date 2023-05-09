"use client"

// TODO
import { useEffect, useState } from "react"

import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { UniLink } from "~/components/ui/UniLink"
import { useDate } from "~/hooks/useDate"
import { useUserRole } from "~/hooks/useUserRole"
import { CSB_SCAN, SITE_URL } from "~/lib/env"
import { useTranslation } from "~/lib/i18n/client"
import { toCid } from "~/lib/ipfs-parser"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { useGetSummary } from "~/queries/page"

export const PostMeta: React.FC<{
  page: ExpandedNote
  site?: ExpandedCharacter
}> = ({ page, site }) => {
  const { t } = useTranslation("common")
  const date = useDate()
  const [isMounted, setIsMounted] = useState(false)
  const { i18n } = useTranslation()
  const summary = useGetSummary({
    cid: toCid(page.metadata?.uri || ""),
    lang: i18n.resolvedLanguage,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [showEdit, setShowEdit] = useState(false)
  const userRole = useUserRole(site?.handle)
  useEffect(() => {
    if (userRole.isSuccess && userRole.data) {
      setShowEdit(true)
    }
  }, [userRole.isSuccess, userRole.data])

  return (
    <div className="xlog-post-meta">
      <div className="text-zinc-400 mt-4 space-x-5 flex items-center">
        <time
          dateTime={date.formatToISO(
            page?.metadata?.content?.date_published || "",
          )}
          className="xlog-post-date whitespace-nowrap"
        >
          {date.formatDate(
            page.metadata?.content?.date_published || "",
            undefined,
            isMounted ? undefined : "America/Los_Angeles",
          )}
        </time>
        {page.metadata?.content?.tags?.filter(
          (tag) => tag !== "post" && tag !== "page",
        ).length ? (
          <>
            <span className="xlog-post-tags space-x-1 truncate min-w-0">
              {page.metadata?.content?.tags
                ?.filter((tag) => tag !== "post" && tag !== "page")
                .map((tag) => (
                  <UniLink
                    className="hover:text-zinc-600"
                    key={tag}
                    href={`/tag/${tag}`}
                  >
                    <>#{tag}</>
                  </UniLink>
                ))}
            </span>
          </>
        ) : null}
        <span className="xlog-post-views inline-flex items-center">
          <i className="icon-[mingcute--eye-line] mr-[2px]" />
          <span>{page.metadata?.content?.views}</span>
        </span>
        <UniLink
          className="xlog-post-blockchain inline-flex items-center"
          href={`${CSB_SCAN}/tx/${page.updatedTransactionHash}`}
        >
          <BlockchainIcon className="fill-zinc-500 ml-1" />
        </UniLink>
        {showEdit && (
          <UniLink
            className="xlog-post-editor inline-flex items-center"
            href={`${SITE_URL}/dashboard/${site?.handle}/editor?id=${
              page.noteId
            }&type=${
              page.metadata?.content?.tags?.includes("post") ? "post" : "page"
            }`}
          >
            <i className="icon-[mingcute--edit-line] mx-1" /> Edit
          </UniLink>
        )}
      </div>
      {(summary.isLoading || summary.data) && (
        <div className="xlog-post-summary border rounded-xl mt-4 p-4 space-y-2">
          <div className="font-bold text-zinc-700 flex items-center">
            <i className="icon-[mingcute--android-2-line] mr-2 text-lg" />
            {t("AI-generated summary")}
          </div>
          <div className="text-zinc-500 leading-loose text-sm">
            {summary.data || `${t("Generating")}...`}
          </div>
        </div>
      )}
    </div>
  )
}
