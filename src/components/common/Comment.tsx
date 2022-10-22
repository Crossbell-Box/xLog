import clsx from "clsx"
import { Note } from "~/lib/types"
import { useGetComments } from "~/queries/page"
import { CommentItem } from "~/components/common/CommentItem"
import { CommentInput } from "~/components/common/CommentInput"

export const Comment: React.FC<{
  page?: Note | null
  className?: string
}> = ({ page, className }) => {
  const comments = useGetComments({
    pageId: page?.id,
  })

  return (
    <div className={clsx("xlog-comment", "comment", className)}>
      <div className="xlog-comment-count border-b pb-2 mb-6">
        <span>
          {comments.data?.count || "0"} Comment
          {comments.data?.count && comments.data.count > 1 ? "s" : ""}
        </span>
      </div>
      <CommentInput pageId={page?.id} />
      <div className="xlog-comment-list space-y-6 pt-6">
        {comments.data?.list?.map((comment) => (
          <CommentItem
            originalId={page?.id}
            comment={comment}
            key={comment.transactionHash}
            depth={0}
          />
        ))}
      </div>
    </div>
  )
}
