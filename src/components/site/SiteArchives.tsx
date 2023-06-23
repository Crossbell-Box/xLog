"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useMemo } from "react"

import { Button } from "~/components/ui/Button"
import { useDate } from "~/hooks/useDate"
import { getSiteRelativeUrl } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { EmptyState } from "../ui/EmptyState"
import { UniLink } from "../ui/UniLink"

export const SiteArchives = () => {
  let currentLength = 0
  const date = useDate()
  const { t } = useTranslation("site")
  const { t: commonT } = useTranslation("common")
  const pathname = usePathname()
  const params = useParams()
  if (params?.tag) {
    params.tag = decodeURIComponent(params.tag as string)
  }

  const site = useGetSite(params?.site as string)
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    limit: 100,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    ...(params?.tag && { tags: [params.tag as string] }),
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
          post.metadata?.content?.tags?.forEach((tag) => {
            if (tag !== "post" && tag !== "page") {
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
      <h2 className="text-xl font-bold page-title">
        {params?.tag || t("Archives")}
      </h2>
      {!posts.data?.pages[0].count && (
        <div className="mt-5">
          <EmptyState />
        </div>
      )}
      {!!posts.data?.pages[0].count && (
        <>
          {!params?.tag && tags.size > 0 && (
            <div className="mt-5">
              <h3 className="text-lg font-bold mb-1 text-zinc-700">
                {t("Tags")}
              </h3>
              <div className="pt-2">
                {[...tags.keys()].map((tag) => (
                  <UniLink
                    key={tag}
                    href={getSiteRelativeUrl(pathname, `/tag/${tag}`)}
                    className="mr-6"
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
                    return (
                      <Link
                        key={post.transactionHash}
                        href={getSiteRelativeUrl(
                          pathname,
                          `/${post.metadata?.content?.slug}`,
                        )}
                        className="flex justify-between items-center p-2 rounded-lg -mx-2 hover:bg-hover"
                      >
                        <span className="text-zinc-700">
                          {post.metadata?.content?.title}
                        </span>
                        <span className="text-zinc-400 mr-3 whitespace-nowrap">
                          {commonT("intlDateTime", {
                            val: new Date(
                              post.metadata?.content?.date_published || "",
                            ),
                            formatParams: {
                              val: {
                                month: "short",
                                day: "numeric",
                              },
                            },
                          })}
                        </span>
                      </Link>
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
