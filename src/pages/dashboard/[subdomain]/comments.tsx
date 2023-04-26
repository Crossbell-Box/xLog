import { GetServerSideProps } from "next"
import { Trans, useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import type { ReactElement } from "react"
import { Virtuoso } from "react-virtuoso"

import { CommentItem } from "~/components/common/CommentItem"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useGetCommentsBySite, useGetSite } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function CommentsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const { t } = useTranslation(["dashboard", "common"])

  const site = useGetSite(subdomain)

  const comments = useGetCommentsBySite({
    characterId: site.data?.metadata?.proof,
  })

  const feedUrl =
    getSiteLink({
      subdomain: subdomain,
    }) + "/feed/comments"

  return (
    <DashboardMain title="Comments">
      <div className="min-w-[270px] max-w-screen-lg">
        <div className="text-sm text-zinc-500 leading-relaxed">
          <p>
            {t(
              "You can subscribe to comments through an RSS reader to receive timely reminders.",
            )}
          </p>
          <p>
            {t("Subscription address:")}{" "}
            <UniLink className="text-accent" href={feedUrl} target="_blank">
              {feedUrl}
            </UniLink>
          </p>
        </div>
        <div className="xlog-comment">
          <div className="prose space-y-4 pt-4">
            <Virtuoso
              className="xlog-comment-list"
              useWindowScroll
              data={comments.data?.pages}
              endReached={() => comments.fetchNextPage()}
              components={{
                Footer: comments.isLoading ? Loader : undefined,
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
                        <Trans
                          i18nKey="comment on your"
                          values={{
                            type: t(type || "", {
                              ns: "common",
                            }),
                            toTitle,
                          }}
                          defaults="commented on your {{type}} <tolink>{{toTitle}}</tolink>"
                          components={{
                            tolink: (
                              <UniLink
                                href={`/api/redirection?characterId=${comment.characterId}&noteId=${comment.noteId}`}
                                target="_blank"
                              >
                                .
                              </UniLink>
                            ),
                          }}
                          ns="dashboard"
                        />
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

CommentsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Comments">{page}</DashboardLayout>
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
