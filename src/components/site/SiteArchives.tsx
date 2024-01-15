"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useParams, usePathname } from "next/navigation"
import { useMemo } from "react"

import { Button } from "~/components/ui/Button"
import { useDate } from "~/hooks/useDate"
import { RESERVED_TAGS } from "~/lib/constants"
import { getSiteRelativeUrl } from "~/lib/helpers"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { EmptyState } from "../ui/EmptyState"
import { UniLink } from "../ui/UniLink"

export const SiteArchives = () => {
  let currentLength = 0
  const date = useDate()
  const t = useTranslations()
  const format = useFormatter()
  const pathname = usePathname()
  const params = useParams()

  const site = useGetSite(params?.site as string)
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    type: ["post", "portfolio"],
    visibility: PageVisibilityEnum.Published,
    limit: 100,
    skipExpansion: true,
  })

  const groupedByYear = useMemo<Map<string, ExpandedNote[]>>(() => {
    const map = new Map()

    if (posts.data?.pages?.length) {
      for (const page of posts.data.pages) {
        for (const post of page.list) {
          const year = date.formatDate(
            post.metadata?.content?.date_published || "",
            "YYYY",
          )
          const items = map.get(year) || []
          items.push(post)
          map.set(year, items)
        }
      }
    }

    return map
  }, [posts.data?.pages, date])

  const tags = useMemo<Map<string, number>>(() => {
    const result = new Map()

    if (posts.data?.pages?.length) {
      for (const page of posts.data.pages) {
        for (const post of page.list) {
          post.metadata?.content?.tags?.forEach((tag: string) => {
            if (!RESERVED_TAGS.includes(tag)) {
              if (result.has(tag)) {
                result.set(tag, result.get(tag) + 1)
              } else {
                result.set(tag, 1)
              }
            }
          })
        }
      }
    }

    return result
  }, [posts.data?.pages])

  if (!posts.data?.pages?.length) return null

  return (
    <>
      {!posts.data?.pages[0].count && (
        <div className="mt-5">
          <EmptyState />
        </div>
      )}
      {!!posts.data?.pages[0].count && (
        <>
          {tags.size > 0 && (
            <div className="mt-5">
              <h3 className="text-lg font-bold mb-1 text-zinc-700">
                {t("Tags")}
              </h3>
              <div className="pt-2">
                {[...tags.keys()].map((tag) => (
                  <UniLink
                    key={tag}
                    href={getSiteRelativeUrl(pathname, `/tag/${tag}`)}
                    className="mr-6 inline-block"
                  >
                    <span className="align-middle">{tag}</span>
                    <span className="text-gray-400 text-sm ml-1 align-middle">
                      ({tags.get(tag)})
                    </span>
                  </UniLink>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 space-y-5">
            {[...groupedByYear.keys()].map((year) => {
              const posts = groupedByYear.get(year)!
              return (
                <div key={year}>
                  <h3 className="text-lg font-bold mb-1 text-zinc-700">
                    {year}
                  </h3>
                  {posts.map((post) => {
                    currentLength++
                    const isPortfolio =
                      post.metadata?.content?.tags?.[0] === "portfolio"
                    const externalLink =
                      post.metadata?.content?.external_urls?.[0] || ""
                    return (
                      <UniLink
                        key={post.transactionHash}
                        href={getSiteRelativeUrl(
                          pathname,
                          isPortfolio
                            ? externalLink
                            : `/${post.metadata?.content?.slug}`,
                        )}
                        className="flex justify-between items-center p-2 rounded-lg -mx-2 hover:bg-hover"
                      >
                        <span className="text-zinc-700">
                          {post.metadata?.content?.title}
                        </span>
                        <span className="text-zinc-400 mr-3 whitespace-nowrap">
                          {format.dateTime(
                            new Date(
                              post.metadata?.content?.date_published || "",
                            ),
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </UniLink>
                    )
                  })}
                </div>
              )
            })}
            {posts.hasNextPage && (
              <div className="text-center">
                <Button
                  className="mt-8 truncate max-w-full !inline-block"
                  variant="outline"
                  onClick={() => posts.fetchNextPage()}
                  isLoading={posts.isFetchingNextPage}
                  aria-label="load more"
                >
                  There are {posts.data?.pages[0].count - currentLength} more
                  post
                  {posts.data?.pages[0].count - currentLength > 1 ? "s" : ""},
                  click to load more
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
