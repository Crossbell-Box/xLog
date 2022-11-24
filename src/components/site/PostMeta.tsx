import { formatDate, formatToISO } from "~/lib/date"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { UniLink } from "~/components/ui/UniLink"
import { Note, Profile } from "~/lib/types"
import { CSB_SCAN } from "~/lib/env"
import { useEffect, useState } from "react"
import { useGetUserSites } from "~/queries/site"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { getSiteLink } from "~/lib/helpers"
import { Avatar } from "~/components/ui/Avatar"

export const PostMeta: React.FC<{
  page: Note
  site?: Profile | null
}> = ({ page, site }) => {
  const [isMounted, setIsMounted] = useState(false)
  const author = useGetUserSites(page.authors[0])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="text-zinc-400 mt-4 xlog-post-meta space-x-5 flex items-center">
      <time
        dateTime={formatToISO(page.date_published)}
        className="xlog-post-date"
      >
        {formatDate(
          page.date_published,
          undefined,
          isMounted ? undefined : "America/Los_Angeles",
        )}
      </time>
      {page.tags?.filter((tag) => tag !== "post" && tag !== "page").length ? (
        <>
          <span className="xlog-post-tags space-x-1">
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
      {author.data?.[0].username &&
        site?.username !== author.data?.[0].username && (
          <>
            <span className="inline-flex items-center">
              <CharacterFloatCard siteId={author.data[0].username}>
                <UniLink
                  href={getSiteLink({
                    subdomain: author.data?.[0].username,
                  })}
                  className="cursor-pointer hover:text-zinc-600 inline-flex items-center"
                >
                  <Avatar
                    className="mr-1"
                    images={author.data[0].avatars || []}
                    size={19}
                    name={author.data[0].name}
                  />
                  <span>{author.data[0].name}</span>
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
    </div>
  )
}
