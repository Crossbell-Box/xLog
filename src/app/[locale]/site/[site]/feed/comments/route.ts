import { getNoteSlug, getSiteLink } from "~/lib/helpers"
import { NextServerResponse } from "~/lib/server-helper"
import { getCommentsBySite, getSite } from "~/models/site.model"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      site: string
    }
  },
) {
  const site = await getSite(params.site)
  const comments = await getCommentsBySite({
    characterId: site?.characterId,
  })

  const link = getSiteLink({
    subdomain: site?.handle || "",
  })

  const data = {
    version: "https://jsonfeed.org/version/1",
    title:
      "Comments on " + site?.metadata?.content?.site_name ||
      site?.metadata?.content?.name,
    description: site?.metadata?.content?.bio,
    icon: site?.metadata?.content?.avatars?.[0],
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
        content_html: `${name} commented on ${type} ${toTitle}: ${comment.metadata?.content?.content}`,
        url: `${link}/${comment.toNote ? getNoteSlug(comment.toNote) : ""}`,
        date_published: comment.createdAt,
        date_modified: comment.updatedAt,
      }
    }),
  }

  const format =
    new URLSearchParams(request.url.split("?")[1]).get("format") === "json"
      ? "json"
      : "xml"

  const res = new NextServerResponse()
  return res.status(200).rss(data, format)
}

export const dynamic = "force-dynamic"
