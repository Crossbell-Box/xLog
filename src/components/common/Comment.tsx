"use client"

import { useState } from "react"
// TODO
import { Virtuoso } from "react-virtuoso"

import { CommentInput } from "~/components/common/CommentInput"
import { CommentItem } from "~/components/common/CommentItem"
import { useTranslation } from "~/lib/i18n/client"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetComments, useUpdateComment } from "~/queries/page"

const Comment = ({
  page,
  className,
  fixHeight,
}: {
  page?: ExpandedNote
  className?: string
  fixHeight?: boolean
}) => {
  const comments = useGetComments({
    characterId: page?.characterId,
    noteId: page?.noteId,
  })

  const { t } = useTranslation("common")

  const data = comments.data?.pages.filter(
    (page) => (page?.list?.length ?? 0) > 0,
  )
  const sortedData = data?.map((item) => {
    if (!item.list) return item

    const sortedList = [...item.list].sort((a, b) => {
      const aIsPinned: any = a.metadata?.content?.pinned === true ? 1 : 0
      const bIsPinned: any = b.metadata?.content?.pinned === true ? 1 : 0
      if (aIsPinned !== bIsPinned) {
        return bIsPinned - aIsPinned
      }
      const aDate = new Date(a.updatedAt)
      const bDate = new Date(b.updatedAt)
      return bDate.getTime() - aDate.getTime()
    })
    return { ...item, list: sortedList }
  })

  const [totalListHeight, setTotalListHeight] = useState(1)

  const updateComment = useUpdateComment()

  const handlePin = (comment: any, pinned: any) => {
    if (comment.noteId) {
      updateComment.mutate({
        characterId: page?.characterId,
        noteId: comment.noteId,
        content: comment.metadata?.content?.content,
        originalCharacterId: page?.characterId,
        originalNoteId: page?.noteId,
        pinned: !pinned,
      })
    }
  }

  return (
    <div
      className={cn("xlog-comment comment", className)}
      id="comments"
      data-hide-print
    >
      <div className="xlog-comment-count border-b pb-2 mb-6">
        <span>
          {comments.isLoading
            ? t("Loading")
            : comments.data?.pages?.[0]?.count || "0"}{" "}
          {t(
            `Comment${
              comments.data?.pages?.[0]?.count &&
              comments.data.pages[0].count > 1
                ? "s"
                : ""
            }`,
          )}
        </span>
      </div>
      <CommentInput characterId={page?.characterId} noteId={page?.noteId} />

      <Virtuoso
        className="xlog-comment-list"
        style={{
          height: fixHeight ? totalListHeight : undefined,
        }}
        useWindowScroll={!fixHeight}
        data={sortedData}
        endReached={() => comments.hasNextPage && comments.fetchNextPage()}
        components={{
          Footer: comments.isLoading ? Loader : undefined,
        }}
        totalListHeightChanged={(height) => {
          if (fixHeight && height > 0) {
            setTotalListHeight(Math.min(height + 71, 900))
          }
        }}
        itemContent={(index, p) =>
          p?.list?.map((comment, idx) => (
            <CommentItem
              className={cn("mt-6", {
                "border-b-0":
                  data &&
                  index === data.length - 1 &&
                  idx === p.list?.length - 1,
              })}
              originalCharacterId={page?.characterId}
              originalNoteId={page?.noteId}
              comment={comment}
              key={comment.transactionHash}
              depth={0}
              onPin={handlePin}
            />
          ))
        }
      ></Virtuoso>
      {comments.isLoading && (
        <div className="relative mt-4 w-full text-sm text-center py-4">
          {t("Loading")}...
        </div>
      )}
    </div>
  )
}

const Loader = () => {
  const { t } = useTranslation("common")
  return (
    <div
      className="relative mt-4 w-full text-sm text-center py-4"
      key={"loading"}
    >
      {t("Loading")}...
    </div>
  )
}

export default Comment
