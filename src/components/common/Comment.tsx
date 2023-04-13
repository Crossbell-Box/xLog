import { cn } from "~/lib/utils"
import { Note } from "~/lib/types"
import { useGetComments } from "~/queries/page"
import { CommentItem } from "~/components/common/CommentItem"
import { CommentInput } from "~/components/common/CommentInput"
import { useTranslation } from "next-i18next"
import InfiniteScroll from "react-infinite-scroller"

export const Comment: React.FC<{
  page?: Note | null
  className?: string
}> = ({ page, className }) => {
  const comments = useGetComments({
    pageId: page?.id,
  })
  const { t } = useTranslation("common")

  return (
    <div
      className={cn("xlog-comment comment overflow-x-hidden", className)}
      id="comments"
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
      <CommentInput pageId={page?.id} />
      <InfiniteScroll
        className="xlog-comment-list space-y-6 pt-6"
        loadMore={comments.fetchNextPage as any}
        hasMore={comments.hasNextPage}
        loader={
          <div
            className="relative mt-4 w-full text-sm text-center py-4"
            key={"loading"}
          >
            {t("Loading")}...
          </div>
        }
      >
        {comments.isLoading ? (
          <div className="relative mt-4 w-full text-sm text-center py-4">
            {t("Loading")}...
          </div>
        ) : (
          comments.data?.pages?.map((p) =>
            p?.list?.map((comment) => (
              <CommentItem
                originalId={page?.id}
                comment={comment}
                key={comment.transactionHash}
                depth={0}
              />
            )),
          )
        )}
      </InfiniteScroll>
    </div>
  )
}
