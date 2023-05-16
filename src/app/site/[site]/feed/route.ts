import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { NextServerResponse } from "~/lib/server-helper"
import { PageVisibilityEnum } from "~/lib/types"
import { getPagesBySite } from "~/models/page.model"
import { getSite } from "~/models/site.model"

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
  const pages = await getPagesBySite({
    characterId: site?.characterId,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    keepBody: true,
  })

  const hasAudio = pages.list?.find((page) => page.metadata?.content?.audio)

  const link = getSiteLink({
    subdomain: site?.handle || "",
    domain: site?.metadata?.content?.custom_domain,
  })
  const data = {
    version: "https://jsonfeed.org/version/1",
    title: site?.metadata?.content?.site_name || site?.metadata?.content?.name,
    description: site?.metadata?.content?.bio,
    icon: site?.metadata?.content?.avatars?.[0],
    home_page_url: link,
    feed_url: `${link}/feed`,
    ...(hasAudio && {
      _itunes: {
        image: site?.metadata?.content?.avatars?.[0],
        author: site?.metadata?.content?.name,
        summary: site?.metadata?.content?.bio,
      },
    }),
    items: pages.list?.map((page) => ({
      id: page.characterId + "-" + page.noteId,
      title: page.metadata?.content?.title,
      summary: page.metadata?.content?.summary,
      content_html: page.metadata?.content?.content,
      url: `${SITE_URL}/api/redirection?characterId=${page.characterId}&noteId=${page.noteId}`,
      image: page.metadata?.content?.cover,
      date_published: page.metadata?.content?.date_published,
      date_modified: page.updatedAt,
      tags: page.metadata?.content?.tags,
      author: site?.metadata?.content?.name,
      ...(page.metadata?.content?.audio && {
        _itunes: {
          image: page.metadata?.content?.cover,
          summary: page.metadata?.content?.summary,
        },
        attachments: [
          {
            url: page.metadata?.content?.audio,
            mime_type: "audio/mpeg",
            title: page.metadata?.content?.title,
          },
        ],
      }),
    })),
  }

  const format =
    new URLSearchParams(request.url.split("?")[1]).get("format") === "xml"
      ? "xml"
      : "json"

  const res = new NextServerResponse()
  return res.status(200).rss(data, format)
}
