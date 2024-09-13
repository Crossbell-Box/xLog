import RSS from "rss"

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
    useHTML: true,
  })

  const hasAudio = pages.list?.find((page) => page.metadata?.content?.audio)

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
    items: pages.list?.map((page) => ({
      id: page.characterId + "-" + page.noteId,
      title: page.metadata?.content?.title || "Untitled",
      summary: page.metadata?.content?.summary,
      content_html: page.metadata?.content?.contentHTML,
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

  pages.list.forEach((page) => {
    feed.item({
      guid: page.characterId + "-" + page.noteId,
      title: page.metadata?.content?.title || "Untitled",
      description: page.metadata?.content?.summary,
      custom_elements: [
        {
          "content:encoded": page.metadata?.content?.contentHTML,
        },
      ],
      url: `${SITE_URL}/api/redirection?characterId=${page.characterId}&noteId=${page.noteId}`,
      date: new Date(page.metadata?.content?.date_published),
      categories: page.metadata?.content?.tags,
      author: site?.metadata?.content?.name,
      enclosure: hasAudio
        ? {
            url: page.metadata?.content?.audio,
            type: "audio/mpeg",
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
