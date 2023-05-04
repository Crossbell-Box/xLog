import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import type { InfiniteData } from "@tanstack/react-query"

import { Button } from "~/components/ui/Button"
import { Image } from "~/components/ui/Image"
import { useDate } from "~/hooks/useDate"
import { getSlugUrl } from "~/lib/helpers"
import { ExpandedNote } from "~/lib/types"

import { EmptyState } from "../ui/EmptyState"

export const SiteHome: React.FC<{
  posts?: InfiniteData<{
    list: ExpandedNote[]
    count: number
  }>
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}> = ({ posts, fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  const router = useRouter()
  const { t } = useTranslation(["common", "site"])
  const date = useDate()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!posts?.pages?.length) return null

  let currentLength = 0

  return (
    <>
      {!posts.pages[0].count && <EmptyState />}
      {!!posts.pages[0].count && (
        <div className="xlog-posts space-y-8">
          {posts.pages.map((posts) =>
            posts.list.map((post) => {
              currentLength++
              return (
                <Link
                  role="article"
                  key={post.transactionHash}
                  href={getSlugUrl(`/${post.metadata?.content?.slug}`)}
                  className="xlog-post focus-visible:outline focus-visible:outline-accent sm:hover:bg-hover bg-white transition-colors px-5 py-7 -mx-5 first:-mt-5 sm:rounded-xl flex flex-col sm:flex-row items-center"
                  suppressHydrationWarning
                >
                  <div className="flex-1 flex justify-center flex-col w-full min-w-0">
                    <h3 className="xlog-post-title text-2xl font-bold text-zinc-700">
                      {post.metadata?.content?.title}
                    </h3>
                    <div className="xlog-post-meta text-sm text-zinc-400 mt-1 space-x-4 flex items-center mr-8">
                      <time
                        dateTime={date.formatToISO(
                          post.metadata?.content?.date_published || "",
                        )}
                        className="xlog-post-date whitespace-nowrap"
                      >
                        {date.formatDate(
                          post.metadata?.content?.date_published || "",
                          undefined,
                          isMounted ? undefined : "America/Los_Angeles",
                        )}
                      </time>
                      {!!post.metadata?.content?.tags?.filter(
                        (tag) => tag !== "post" && tag !== "page",
                      ).length && (
                        <span
                          aria-label="tags for this post"
                          className="xlog-post-tags space-x-1 truncate min-w-0"
                        >
                          {post.metadata?.content?.tags
                            ?.filter((tag) => tag !== "post" && tag !== "page")
                            .map((tag) => (
                              <span
                                className="hover:text-zinc-600"
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  router.push(`/tag/${tag}`)
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                        </span>
                      )}
                      <span
                        aria-label="views for this post"
                        className="xlog-post-views inline-flex items-center"
                      >
                        <i className="icon-[mingcute--eye-line] mr-[2px]" />
                        <span>{post.metadata?.content?.views}</span>
                      </span>
                    </div>
                    <div
                      className="xlog-post-excerpt mt-3 text-zinc-500 line-clamp-2"
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      {post.metadata?.content?.summary}
                      {post.metadata?.content?.summary && "..."}
                    </div>
                  </div>
                  {post.metadata?.content?.cover && (
                    <div className="xlog-post-cover flex items-center relative w-full sm:w-24 h-40 sm:h-24 mt-2 sm:ml-4 sm:mt-0">
                      <Image
                        className="object-cover rounded"
                        alt="cover"
                        fill={true}
                        src={post.metadata?.content?.cover}
                      ></Image>
                    </div>
                  )}
                </Link>
              )
            }),
          )}
        </div>
      )}
      {hasNextPage && (
        <Button
          className="mt-8 w-full bg-zinc-50 text-sm"
          variant="text"
          onClick={fetchNextPage}
          isLoading={isFetchingNextPage}
          aria-label="load more"
        >
          {t("load more", {
            ns: "site",
            name: t(
              "post" + (posts?.pages[0].count - currentLength > 1 ? "s" : ""),
            ),
            count: posts?.pages[0].count - currentLength,
          })}
        </Button>
      )}
    </>
  )
}
