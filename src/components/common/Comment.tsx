"use client"

import { Virtuoso } from "react-virtuoso"

import { CommentInput } from "~/components/common/CommentInput"
import { CommentItem } from "~/components/common/CommentItem"
import { useTranslation } from "~/lib/i18n/client"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetComments, useGetPage } from "~/queries/page"

export const Comment: React.FC<{
  page?: ExpandedNote
  className?: string
}> = ({ page, className }) => {
  const comments = useGetComments({
    characterId: page?.characterId,
    noteId: page?.noteId,
  })
  const { t } = useTranslation("common")

  // For viewing statistics
  useGetPage({
    characterId: page?.characterId,
    noteId: page?.noteId,
  })

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
        useWindowScroll
        data={comments.data?.pages}
        endReached={() => comments.hasNextPage && comments.fetchNextPage()}
        components={{
          Footer: comments.isLoading ? Loader : undefined,
        }}
        itemContent={(_, p) =>
          p?.list?.map((comment, idx) => (
            <CommentItem
              className="mt-6"
              originalCharacterId={page?.characterId}
              originalNoteId={page?.noteId}
              comment={comment}
              key={comment.transactionHash}
              depth={0}
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
