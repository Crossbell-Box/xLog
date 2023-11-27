"use client"

import { useTranslations } from "next-intl"

import { UseInfiniteQueryResult } from "@tanstack/react-query"

import PostCard from "~/components/common/PostCard"
import { Button } from "~/components/ui/Button"
import { EmptyState } from "~/components/ui/EmptyState"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

export default function PostList({
  posts,
  pinnedNoteId,
  keyword,
  isShorts,
}: {
  posts: UseInfiniteQueryResult<
    {
      list: ExpandedNote[]
      count: number
      cursor: string | null
    },
    unknown
  >
  pinnedNoteId?: number | null
  keyword?: string
  isShorts?: boolean
}) {
  const t = useTranslations()

  if (!posts.data?.pages?.length) return null

  let currentLength = 0

  return (
    <>
      {!posts.data.pages[0].count && <EmptyState />}
      {!!posts.data.pages[0].count && (
        <div
          className={cn(
            "xlog-posts grid gap-3 grid-cols-1",
            isShorts ? "sm:grid-cols-4" : "sm:grid-cols-3 sm:gap-6",
          )}
        >
          {posts.data.pages.map((posts, listIndex) =>
            posts.list.map((post, postIndex) => {
              currentLength++
              return (
                <PostCard
                  key={`${post.characterId}-${post.noteId}`}
                  post={post}
                  isPinned={post.noteId === pinnedNoteId}
                  keyword={keyword}
                  showPublishTime={true}
                  isShort={isShorts}
                />
              )
            }),
          )}
        </div>
      )}
      {posts.hasNextPage && posts.data?.pages[0].count - currentLength > 0 && (
        <div className="text-center">
          <Button
            className="mt-8 truncate max-w-full !inline-block"
            variant="outline"
            onClick={() => posts.fetchNextPage()}
            isLoading={posts.isFetchingNextPage}
            aria-label="load more"
          >
            <span className="align-middle">
              {t("load more", {
                ns: "site",
                name: t(
                  "post" +
                    (posts.data?.pages[0].count - currentLength > 1 ? "s" : ""),
                ),
                count: posts.data?.pages[0].count - currentLength,
              })}
            </span>
          </Button>
        </div>
      )}
    </>
  )
}
