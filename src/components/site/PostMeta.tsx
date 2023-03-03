import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { UniLink } from "~/components/ui/UniLink"
import { Note, Profile } from "~/lib/types"
import { CSB_SCAN, SITE_URL } from "~/lib/env"
import { useEffect, useState } from "react"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { getSiteLink } from "~/lib/helpers"
import { Avatar } from "~/components/ui/Avatar"
import {
  EyeIcon,
  PencilSquareIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline"
import { useUserRole } from "~/hooks/useUserRole"
import { useTranslation } from "next-i18next"
import { useDate } from "~/hooks/useDate"
import { useGetSummary } from "~/queries/page"
import { toCid } from "~/lib/ipfs-parser"

export const PostMeta: React.FC<{
  page: Note
  site?: Profile | null
  author?: Profile | null
}> = ({ page, site, author }) => {
  const { t } = useTranslation("common")
  const date = useDate()
  const [isMounted, setIsMounted] = useState(false)
  const { i18n } = useTranslation()
  const summary = useGetSummary({
    cid: toCid(page.related_urls?.[0] || ""),
    lang: i18n.resolvedLanguage,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [showEdit, setShowEdit] = useState(false)
  const userRole = useUserRole(site?.username)
  useEffect(() => {
    if (userRole.isSuccess && userRole.data) {
      setShowEdit(true)
    }
  }, [userRole.isSuccess, userRole.data])

  return (
    <div className="xlog-post-meta">
      <div className="text-zinc-400 mt-4 space-x-5 flex items-center">
        <time
          dateTime={date.formatToISO(page.date_published)}
          className="xlog-post-date whitespace-nowrap"
        >
          {date.formatDate(
            page.date_published,
            undefined,
            isMounted ? undefined : "America/Los_Angeles",
          )}
        </time>
        {page.tags?.filter((tag) => tag !== "post" && tag !== "page").length ? (
          <>
            <span className="xlog-post-tags space-x-1 truncate min-w-0">
              {page.tags
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
          <EyeIcon className="w-4 h-4 inline-block mr-[2px]" />
          <span>{page.views}</span>
        </span>
        {author?.username && site?.username !== author?.username && (
          <>
            <span className="inline-flex items-center">
              <CharacterFloatCard siteId={author?.username}>
                <UniLink
                  href={getSiteLink({
                    subdomain: author?.username,
                  })}
                  className="cursor-pointer hover:text-zinc-600 inline-flex items-center"
                >
                  <Avatar
                    className="mr-1"
                    images={author?.avatars || []}
                    size={19}
                    name={author?.name}
                  />
                  <span>{author?.name}</span>
                </UniLink>
              </CharacterFloatCard>
            </span>
          </>
        )}
        <UniLink
          className="xlog-post-blockchain inline-block"
          href={
            page.related_urls?.filter((url) =>
              url.startsWith(CSB_SCAN + "/tx/"),
            )?.[0]
          }
        >
          <BlockchainIcon className="fill-zinc-500 ml-1" />
        </UniLink>
        {showEdit && (
          <UniLink
            className="xlog-post-editor inline-flex items-center"
            href={`${SITE_URL}/dashboard/${site?.username}/editor?id=${
              page.id
            }&type=${page.tags?.includes("post") ? "post" : "page"}`}
          >
            <PencilSquareIcon className="w-4 h-4 mx-1 inline-block" /> Edit
          </UniLink>
        )}
      </div>
      {!(summary.isSuccess && !summary.data) && (
        <div className="border rounded-xl mt-4 p-4 space-y-2">
          <div className="font-bold text-zinc-700 flex items-center">
            <LightBulbIcon className="inline w-4 h-4 mr-2 stroke-[2]" />
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
