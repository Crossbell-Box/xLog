"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import reactStringReplace from "react-string-replace"

import PostCover from "~/components/site/PostCover"
import { Button } from "~/components/ui/Button"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "~/lib/i18n/client"
import { useGetSearchPagesBySite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { EmptyState } from "../ui/EmptyState"

export const SiteSearch = () => {
  const router = useRouter()
  const { t } = useTranslation("site")
  const date = useDate()

  const searchParams = useSearchParams()
  const params = useParams()
  const site = useGetSite(params?.site as string)
  const keyword = searchParams?.get("q") || undefined
  const posts = useGetSearchPagesBySite({
    characterId: site.data?.characterId,
    keyword,
  })

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  let currentLength = 0

  return (
    <>
      <h2 className="mb-8 mt-5 text-zinc-500">
        {posts.data?.pages?.[0].count || "0"} {t("results")}
      </h2>
      {posts.isLoading && <>{t("Loading")}...</>}
      {!posts.data?.pages?.[0].count && <EmptyState />}
      {!!posts.data?.pages?.[0].count && (
        <div className="xlog-posts space-y-8">
          {posts.data?.pages.map((posts) =>
            posts.list.map((post) => {
              currentLength++
              return (
                <Link
                  key={post.noteId}
                  href={`/${post.metadata.content.slug}`}
                  className="xlog-post sm:hover:bg-hover bg-white transition-all px-5 py-7 -mx-5 first:-mt-5 sm:rounded-xl flex flex-col sm:flex-row items-center group"
                >
                  <PostCover cover={post.metadata?.content.cover} />
                  <div className="flex-1 flex justify-center flex-col w-full min-w-0">
                    <h3 className="xlog-post-title text-2xl font-bold text-zinc-700 line-clamp-2">
                      {post.metadata.content.title}
                    </h3>
                    <div className="xlog-post-meta text-sm text-zinc-400 mt-1 space-x-4 flex items-center mr-8">
                      <time
                        dateTime={date.formatToISO(
                          post.metadata.content.date_published ||
                            post.createdAt,
                        )}
                        className="xlog-post-date whitespace-nowrap"
                      >
                        {date.formatDate(
                          post.metadata.content.date_published ||
                            post.createdAt,
                          undefined,
                          isMounted ? undefined : "America/Los_Angeles",
                        )}
                      </time>
                      {!!post.metadata.content.tags?.filter(
                        (tag) => tag !== "post" && tag !== "page",
                      ).length && (
                        <span className="xlog-post-tags space-x-1 truncate min-w-0">
                          {post.metadata.content.tags
                            ?.filter((tag) => tag !== "post" && tag !== "page")
                            .map((tag) => (
                              <span
                                className="hover:text-zinc-600"
                                key={tag}
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push(`/tag/${tag}`)
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                        </span>
                      )}
                      <span className="xlog-post-views inline-flex items-center">
                        <i className="icon-[mingcute--eye-line] mr-[2px]" />
                        <span>{post.metadata.content.views}</span>
                      </span>
                    </div>
                    <div
                      className="xlog-post-excerpt mt-3 text-zinc-500 line-clamp-2"
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      {keyword
                        ? reactStringReplace(
                            post.metadata?.content?.summary || "",
                            keyword,
                            (match, i) => (
                              <span key={i} className="bg-yellow-200">
                                {match}
                              </span>
                            ),
                          )
                        : post.metadata?.content?.summary}
                      {post.metadata.content.summary && "..."}
                    </div>
                  </div>
                </Link>
              )
            }),
          )}
        </div>
      )}
      {posts.hasNextPage && posts.data?.pages[0].count && (
        <Button
          className="mt-8 w-full bg-zinc-50 text-sm"
          variant="text"
          onClick={() => posts.fetchNextPage()}
          isLoading={posts.isFetchingNextPage}
          aria-label="load more"
        >
          {t("load more", {
            name: t(
              "post" +
                (posts.data?.pages[0].count - currentLength > 1 ? "s" : ""),
            ),
            count: posts.data?.pages[0].count - currentLength,
          })}
        </Button>
      )}
    </>
  )
}
