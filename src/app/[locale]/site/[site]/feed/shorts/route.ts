import RSS from "rss"

import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { toGateway } from "~/lib/ipfs-parser"
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

  const shorts = await getPagesBySite({
    characterId: site?.characterId,
    type: "short",
    visibility: PageVisibilityEnum.Published,
    keepBody: true,
    useHTML: true,
  })

  const email = site?.metadata?.content?.connected_accounts
    ?.map((account) => {
      const match = account.match(/:\/\/account:(.*)@email/)
      if (match) {
        return match[1]
      }
    })
    .find((email) => email)
  const link = getSiteLink({
    subdomain: site?.handle || "",
    domain: site?.metadata?.content?.custom_domain,
  })

  const data = {
    version: "https://jsonfeed.org/version/1",
    title: `${site?.metadata?.content?.site_name || site?.metadata?.content?.name}`,
    description: `${site?.metadata?.content?.name || site?.handle}`,
    icon: site?.metadata?.content?.avatars?.[0],
    home_page_url: `${link}/shorts`,
    feed_url: `${link}/shorts/feed`,
    items: shorts.list?.map((page) => {
      const title =
        page.metadata?.content?.title ||
        `${new Date(page.metadata?.content?.date_published || page.createdAt).toLocaleDateString()}`

      const allImages = (page.metadata?.content?.images || []).map(
        (img: string) => toGateway(img),
      )

      const originalContent =
        page.metadata?.content?.contentHTML ||
        page.metadata?.content?.content ||
        ""
      const imagesHtml =
        allImages.length > 0
          ? allImages
              .map(
                (img: string) =>
                  `<img src="${img}" style="max-width: 100%; height: auto; margin: 8px 0;" />`,
              )
              .join("")
          : ""

      const contentWithImages = imagesHtml
        ? `${imagesHtml}<br/>${originalContent}`
        : originalContent

      return {
        id: page.characterId + "-" + page.noteId,
        title,
        summary:
          page.metadata?.content?.summary ||
          (page.metadata?.content?.content
            ? page.metadata.content.content.slice(0, 200) + "..."
            : ""),
        content_html: contentWithImages,
        url: `${SITE_URL}/api/redirection?characterId=${page.characterId}&noteId=${page.noteId}`,
        image: allImages[0],
        ...(allImages.length > 0 && {
          attachments: allImages.map((img: string) => ({
            url: img,
          })),
        }),
        date_published:
          page.metadata?.content?.date_published || page.createdAt,
        date_modified: page.updatedAt,
        tags: page.metadata?.content?.tags,
        author: site?.metadata?.content?.name,
      }
    }),
  }

  const feed = new RSS({
    title: `${site?.metadata?.content?.site_name || site?.metadata?.content?.name || "Untitled"}`,
    description: `${site?.metadata?.content?.name || site?.handle}`,
    image_url: site?.metadata?.content?.avatars?.[0],
    site_url: `${link}/shorts`,
    feed_url: `${link}/shorts/feed`,
    custom_namespaces: {
      media: "http://search.yahoo.com/mrss/",
      content: "http://purl.org/rss/1.0/modules/content/",
    },
  })

  shorts.list?.forEach((page) => {
    const title =
      page.metadata?.content?.title ||
      `${new Date(page.metadata?.content?.date_published || page.createdAt).toLocaleDateString()}`

    const allImages = (page.metadata?.content?.images || []).map(
      (img: string) => toGateway(img),
    )

    const itemContent =
      page.metadata?.content?.contentHTML ||
      page.metadata?.content?.content ||
      ""

    const imagesHtml =
      allImages.length > 0
        ? allImages
            .map(
              (img: string) =>
                `<img src="${img}" style="max-width: 100%; height: auto; margin: 8px 0;" />`,
            )
            .join("")
        : ""

    const contentWithImages = imagesHtml
      ? `${imagesHtml}<br/>${itemContent}`
      : itemContent

    const mediaContentElements = allImages.map((img: string) => ({
      "media:content": { _attr: { url: img, type: "image", medium: "image" } },
    }))

    feed.item({
      guid: page.characterId + "-" + page.noteId,
      title,
      description:
        page.metadata?.content?.summary ||
        (page.metadata?.content?.content
          ? page.metadata.content.content.slice(0, 200) + "..."
          : ""),
      custom_elements: [
        {
          "content:encoded": contentWithImages,
        },
        ...mediaContentElements,
      ],
      url: `${SITE_URL}/api/redirection?characterId=${page.characterId}&noteId=${page.noteId}`,
      date: new Date(page.metadata?.content?.date_published || page.createdAt),
      categories: page.metadata?.content?.tags,
      author: site?.metadata?.content?.name,
      enclosure: allImages[0]
        ? {
            url: allImages[0],
            type: "image/jpeg",
          }
        : undefined,
    })
  })

  const format =
    new URLSearchParams(request.url.split("?")[1]).get("format") === "json"
      ? "json"
      : "xml"

  const res = new NextServerResponse()
  return res.status(200).rss(format === "json" ? data : feed.xml(), format)
}

export const dynamic = "force-dynamic"
export const revalidate = 0
