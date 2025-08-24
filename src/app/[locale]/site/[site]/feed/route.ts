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

  const url = new URL(request.url)
  const includeShorts = url.searchParams.get("shorts") !== "false"

  const posts = await getPagesBySite({
    characterId: site?.characterId,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    keepBody: true,
    useHTML: true,
  })

  let allPages = posts.list || []

  if (includeShorts) {
    const shorts = await getPagesBySite({
      characterId: site?.characterId,
      type: "short",
      visibility: PageVisibilityEnum.Published,
      keepBody: true,
      useHTML: true,
    })

    allPages = [...(posts.list || []), ...(shorts.list || [])].sort((a, b) => {
      const dateA = new Date(a.metadata?.content?.date_published || a.createdAt)
      const dateB = new Date(b.metadata?.content?.date_published || b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
  }

  const hasAudio = allPages.find((page) => page.metadata?.content?.audio)

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

  const followFeedId = site?.metadata?.content?.follow?.feed_id
  const followUserId = site?.metadata?.content?.follow?.user_id

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
        author:
          site?.metadata?.content?.site_name || site?.metadata?.content?.name,
        summary: site?.metadata?.content?.bio,
        owner: {
          email: email,
          name: site?.metadata?.content?.name,
        },
      },
    }),
    ...(followFeedId && followUserId
      ? {
          follow_challenge: {
            feed_id: followFeedId,
            user_id: followUserId,
          },
        }
      : {}),
    items: allPages?.map((page) => {
      const isShort = page.metadata?.content?.tags?.includes("short")
      const title =
        page.metadata?.content?.title ||
        (isShort
          ? `${new Date(page.metadata?.content?.date_published || page.createdAt).toLocaleDateString()}`
          : "Untitled")

      const allImages = isShort
        ? (page.metadata?.content?.images || []).map((img: string) =>
            toGateway(img),
          )
        : page.metadata?.content?.cover
          ? [toGateway(page.metadata?.content?.cover)]
          : []

      const originalContent =
        page.metadata?.content?.contentHTML ||
        page.metadata?.content?.content ||
        ""
      const imagesHtml =
        isShort && allImages.length > 0
          ? allImages
              .map(
                (img: string) =>
                  `<img src="${img}" style="max-width: 100%; height: auto; margin: 8px 0;" />`,
              )
              .join("")
          : ""

      const contentWithImages =
        isShort && imagesHtml
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
        ...(isShort &&
          allImages.length > 0 && {
            attachments: allImages.map((img: string) => ({
              url: img,
            })),
          }),
        date_published:
          page.metadata?.content?.date_published || page.createdAt,
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
      }
    }),
  }

  const feed = new RSS({
    title:
      site?.metadata?.content?.site_name ||
      site?.metadata?.content?.name ||
      "Untitled",
    description: site?.metadata?.content?.bio,
    image_url: site?.metadata?.content?.avatars?.[0],
    site_url: link,
    feed_url: `${link}/feed`,
    custom_namespaces: {
      itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd",
      media: "http://search.yahoo.com/mrss/",
      content: "http://purl.org/rss/1.0/modules/content/",
    },
    custom_elements: [
      ...(hasAudio
        ? [
            { "itunes:image": site?.metadata?.content?.avatars?.[0] },
            {
              "itunes:author":
                site?.metadata?.content?.site_name ||
                site?.metadata?.content?.name,
            },
            { "itunes:summary": site?.metadata?.content?.bio },
            {
              "itunes:owner": [
                {
                  "itunes:email": email,
                },
                {
                  "itunes:name": site?.metadata?.content?.name,
                },
              ],
            },
          ]
        : []),
      ...(followFeedId && followUserId
        ? [
            {
              follow_challenge: [
                { feedId: followFeedId },
                { userId: followUserId },
              ],
            },
            ,
          ]
        : []),
    ],
  })

  allPages.forEach((page) => {
    const isShort = page.metadata?.content?.tags?.includes("short")
    const title =
      page.metadata?.content?.title ||
      (isShort
        ? `${new Date(page.metadata?.content?.date_published || page.createdAt).toLocaleDateString()}`
        : "Untitled")

    const allImages = isShort
      ? (page.metadata?.content?.images || []).map((img: string) =>
          toGateway(img),
        )
      : page.metadata?.content?.cover
        ? [toGateway(page.metadata?.content?.cover)]
        : []

    const itemContent =
      page.metadata?.content?.contentHTML ||
      page.metadata?.content?.content ||
      ""

    const imagesHtml =
      isShort && allImages.length > 0
        ? allImages
            .map(
              (img: string) =>
                `<img src="${img}" style="max-width: 100%; height: auto; margin: 8px 0;" />`,
            )
            .join("")
        : ""

    const contentWithImages =
      isShort && imagesHtml ? `${imagesHtml}<br/>${itemContent}` : itemContent

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
      enclosure: hasAudio
        ? {
            url: page.metadata?.content?.audio,
            type: "audio/mpeg",
          }
        : allImages[0]
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
