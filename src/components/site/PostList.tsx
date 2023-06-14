"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { memo } from "react"
import reactStringReplace from "react-string-replace"

import { UseInfiniteQueryResult } from "@tanstack/react-query"

import FadeIn from "~/components/common/FadeIn"
import PostCover from "~/components/site/PostCover"
import { Button } from "~/components/ui/Button"
import { EmptyState } from "~/components/ui/EmptyState"
import { useIsClient } from "~/hooks/useClient"
import { useDate } from "~/hooks/useDate"
import { getSlugUrl } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { ExpandedNote } from "~/lib/types"

export default function PostList({
  posts,
  keyword,
}: {
  posts: UseInfiniteQueryResult<
    {
      list: ExpandedNote[]
      count: number
      cursor: string | null
    },
    unknown
  >
  keyword?: string
}) {
  const { t } = useTranslation("site")

  if (!posts.data?.pages?.length) return null

  let currentLength = 0

  return (
    <>
      {!posts.data.pages[0].count && <EmptyState />}
      {!!posts.data.pages[0].count && (
        <div className="xlog-posts space-y-8">
          {posts.data.pages.map((posts) =>
            posts.list.map((post) => {
              currentLength++
              return (
                <PostItem post={post} keyword={keyword} key={post.noteId} />
              )
            }),
          )}
        </div>
      )}
      {posts.hasNextPage && (
        <div className="text-center">
          <Button
            className="mt-8 truncate max-w-full !inline-block before:!hidden"
            variant="outline"
            onClick={() => posts.fetchNextPage()}
            isLoading={posts.isFetchingNextPage}
            aria-label="load more"
          >
            {t("load more", {
              ns: "site",
              name: t(
                "post" +
                  (posts.data?.pages[0].count - currentLength > 1 ? "s" : ""),
              ),
              count: posts.data?.pages[0].count - currentLength,
            })}
          </Button>
        </div>
      )}
    </>
  )
}

const PostItem = memo(
  ({ post, keyword }: { post: ExpandedNote; keyword?: string }) => {
    const isMounted = useIsClient()
    const date = useDate()
    const router = useRouter()

    return (
      <FadeIn
        key={`${post.characterId}-${post.noteId}`}
        className="xlog-post -mx-5 first:-mt-5 sm:rounded-2xl bg-white"
        role="article"
        aria-label={post.metadata?.content?.title}
      >
        <Link
          className="flex flex-col sm:flex-row items-center group px-5 py-7 focus-visible:outline focus-visible:outline-accent"
          href={getSlugUrl(`/${post.metadata?.content?.slug}`)}
          suppressHydrationWarning
        >
          <PostCover cover={post.metadata?.content?.cover} />
          <div className="flex-1 flex justify-center flex-col w-full min-w-0">
            <h3 className="xlog-post-title text-2xl font-bold text-zinc-700 line-clamp-2">
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
              {post.metadata?.content?.summary && "..."}
            </div>
          </div>
        </Link>
      </FadeIn>
    )
  },
)

PostItem.displayName = "PostItem"
