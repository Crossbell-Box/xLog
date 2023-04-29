import type { GetServerSidePropsContext } from "next"

import { QueryClient } from "@tanstack/react-query"

import { getSiteLink } from "~/lib/helpers"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"
import { renderPageContent } from "~/markdown"
import { fetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

import { SITE_URL } from "./env"

export const getJsonFeed = async (domainOrSubdomain: string, path: string) => {
  const queryClient = new QueryClient()

  const site = await fetchGetSite(domainOrSubdomain, queryClient)
  const pages = await fetchGetPagesBySite(
    {
      site: domainOrSubdomain,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      keepBody: true,
    },
    queryClient,
  )

  const hasAudio = pages.list?.find((page: any) => page.audio)

  const link = getSiteLink({
    subdomain: site.username || "",
  })
  return {
    version: "https://jsonfeed.org/version/1",
    title: site.name,
    description: site.description,
    icon: site.avatars?.[0],
    home_page_url: link,
    feed_url: `${link}${path}`,
    ...(hasAudio && {
      _itunes: {
        image: site.avatars?.[0],
        author: site.name,
        summary: site.description,
      },
    }),
    items: pages.list?.map((page: any) => ({
      id: page.id,
      title: page.title,
      content_html:
        page.body?.content &&
        renderPageContent(page.body?.content, true).contentHTML,
      summary: page.summary?.content,
      url: `${link}/${page.slug || page.id}`,
      image: page.cover,
      date_published: page.date_published,
      date_modified: page.date_updated,
      tags: page.tags,
      author: site.name,
      ...(page.audio && {
        _itunes: {
          image: page.cover,
          summary: page.summary?.content,
        },
        attachments: [
          {
            url: page.audio,
            mime_type: "audio/mpeg",
            title: page.title,
          },
        ],
      }),
    })),
  }
}

export const parsePost = (post: ExpandedNote) => {
  return {
    id: `${post.characterId}-${post.noteId}`,
    title: post.metadata?.content?.title,
    summary: post.metadata?.content?.summary,
    url: `${SITE_URL}/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`,
    image: post.metadata?.content?.cover,
    date_published: post.createdAt,
    date_modified: post.updatedAt,
    tags: post.metadata?.content?.tags,
    author: {
      name: post.character?.metadata?.content?.name || post.character?.handle,
      url: `${SITE_URL}/api/redirection?characterId=${post.characterId}`,
      twitter: post.character?.metadata?.content?.connected_accounts
        ?.find((account) => account?.endsWith?.("@twitter"))
        ?.match(/csb:\/\/account:([^@]+)@twitter/)?.[1],
      handle: post.character?.handle,
    },
  }
}

export const setHeader = (ctx: GetServerSidePropsContext) => {
  ctx.res.setHeader("Content-Type", "application/feed+json; charset=utf-8")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  ctx.res.setHeader("Cache-Control", "public, max-age=1800")
}
