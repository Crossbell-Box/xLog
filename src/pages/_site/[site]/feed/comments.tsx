// @ts-ignore
import jsonfeedToRSS from "jsonfeed-to-rss"
import { GetServerSideProps } from "next"

import { QueryClient } from "@tanstack/react-query"

import { getSiteLink } from "~/lib/helpers"
import { setHeader } from "~/lib/json-feed"
import { renderPageContent } from "~/markdown"
import { fetchGetComments, fetchGetSite } from "~/queries/site.server"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  setHeader(ctx)
  const domainOrSubdomain = ctx.params!.site as string

  const site = await fetchGetSite(domainOrSubdomain, queryClient)
  const comments = await fetchGetComments(
    {
      characterId: site?.metadata?.proof,
    },
    queryClient,
  )

  const link = getSiteLink({
    subdomain: site.username || "",
  })

  const data = {
    version: "https://jsonfeed.org/version/1",
    title: "Comments on " + site.name,
    description: site.description,
    icon: site.avatars?.[0],
    home_page_url: link,
    feed_url: `${link}/feed/notifications`,
    items: comments?.list?.map((comment) => {
      const type = comment.toNote?.metadata?.content?.tags?.[0]
      let toTitle
      if (type === "post" || type === "page") {
        toTitle = comment.toNote?.metadata?.content?.title
      } else {
        if ((comment.toNote?.metadata?.content?.content?.length || 0) > 30) {
          toTitle =
            comment.toNote?.metadata?.content?.content?.slice(0, 30) + "..."
        } else {
          toTitle = comment.toNote?.metadata?.content?.content
        }
      }
      const name =
        comment?.character?.metadata?.content?.name ||
        `@${comment?.character?.handle}`

      return {
        id: comment.characterId + "-" + comment.noteId,
        title: `${name}: ${comment.metadata?.content?.content}`,
        content_html: `${name} commented on ${type} ${toTitle}: ${
          renderPageContent(comment.metadata?.content?.content || "")
            .contentHTML
        }`,
        url: `${link}/${
          comment.toNote?.metadata?.content?.attributes?.find(
            (attribute: any) => attribute.trait_type === "xlog_slug",
          )?.value || comment.toNote?.characterId + "-" + comment.toNote?.noteId
        }`,
        date_published: comment.createdAt,
        date_modified: comment.updatedAt,
      }
    }),
  }

  ctx.res.write(
    ctx.query.format === "xml" ? jsonfeedToRSS(data) : JSON.stringify(data),
  )
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
