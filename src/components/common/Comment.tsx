"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
// TODO
import { Virtuoso } from "react-virtuoso"

import { CommentInput } from "~/components/common/CommentInput"
import { CommentItem } from "~/components/common/CommentItem"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetComments } from "~/queries/page"

import { Loading } from "./Loading"

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
  const t = useTranslations()

  const data = comments.data?.pages.filter(
    (page) => (page?.list?.length ?? 0) > 0,
  )

  const [totalListHeight, setTotalListHeight] = useState(1)

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
        data={data}
        endReached={() => comments.hasNextPage && comments.fetchNextPage()}
        components={{
          Footer: comments.isFetchingNextPage ? Loading : undefined,
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
            />
          ))
        }
      ></Virtuoso>
      {comments.isLoading && <Loading />}
    </div>
  )
}

export default Comment
