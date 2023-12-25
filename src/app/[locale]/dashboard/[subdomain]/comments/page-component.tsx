"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { Virtuoso } from "react-virtuoso"

import { CommentItem } from "~/components/common/CommentItem"
import { Loading } from "~/components/common/Loading"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import { useGetCommentsBySite, useGetSite } from "~/queries/site"

export default function CommentsPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const t = useTranslations()

  const site = useGetSite(subdomain)

  const comments = useGetCommentsBySite({
    characterId: site.data?.characterId,
  })

  // fetch next page when we get a empty list
  useEffect(() => {
    if (
      comments.data?.pages &&
      comments.data.pages.at(-1)?.list.length === 0 &&
      comments.hasNextPage
    ) {
      comments.fetchNextPage()
    }
  }, [comments.data, comments.hasNextPage, comments.fetchNextPage])

  const data = comments.data?.pages.filter((page) => page.list.length > 0)

  const feedUrl =
    getSiteLink({
      subdomain: subdomain,
    }) + "/feed/comments"

  return (
    <DashboardMain title="Comments">
      <div className="min-w-[270px] max-w-screen-lg flex-1 flex flex-col">
        <div className="text-sm text-zinc-500 leading-relaxed">
          <p>
            {t(
              "You can subscribe to comments through an RSS reader to receive timely reminders",
            )}
          </p>
          <p>
            {t("Subscription address:")}{" "}
            <UniLink className="text-accent" href={feedUrl} target="_blank">
              {feedUrl}
            </UniLink>
          </p>
        </div>
        <div className="xlog-comment flex-1 flex">
          <div className="prose space-y-4 pt-4 flex-1">
            <Virtuoso
              className="xlog-comment-list"
              data={data}
              endReached={() =>
                comments.hasNextPage && comments.fetchNextPage()
              }
              components={{
                Footer: comments.isLoading ? Loading : undefined,
              }}
              itemContent={(_, p) =>
                p?.list?.map((comment, idx) => {
                  const type = comment.toNote?.metadata?.content?.tags?.[0]
                  let toTitle
                  if (type === "post" || type === "page") {
                    toTitle = comment.toNote?.metadata?.content?.title
                  } else {
                    if (
                      (comment.toNote?.metadata?.content?.content?.length ||
                        0) > 30
                    ) {
                      toTitle =
                        comment.toNote?.metadata?.content?.content?.slice(
                          0,
                          30,
                        ) + "..."
                    } else {
                      toTitle = comment.toNote?.metadata?.content?.content
                    }
                  }
                  const name =
                    comment?.character?.metadata?.content?.name ||
                    `@${comment?.character?.handle}`

                  return (
                    <div key={comment.transactionHash} className="mt-6">
                      <div>
                        {name}{" "}
                        {t.rich("comment on your", {
                          tolink: (chunks) => (
                            <UniLink
                              href={`/api/redirection?characterId=${comment.characterId}&noteId=${comment.noteId}`}
                              target="_blank"
                            >
                              {chunks}
                            </UniLink>
                          ),
                          type: t(type),
                          toTitle,
                        })}
                        :
                      </div>
                      <CommentItem
                        className="mt-6"
                        comment={comment}
                        depth={0}
                      />
                    </div>
                  )
                })
              }
            ></Virtuoso>
          </div>
        </div>
      </div>
    </DashboardMain>
  )
}
