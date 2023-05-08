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
      characterId: site?.characterId,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      keepBody: true,
    },
    queryClient,
  )

  const hasAudio = pages.list?.find((page) => page.metadata?.content?.audio)

  const link = getSiteLink({
    domain: site?.metadata?.content?.custom_domain,
    subdomain: site?.handle || "",
  })
  return {
    version: "https://jsonfeed.org/version/1",
    title: site?.metadata?.content?.name,
    description: site?.metadata?.content?.bio,
    icon: site?.metadata?.content?.avatars?.[0],
    home_page_url: link,
    feed_url: `${link}${path}`,
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
      content_html:
        page.metadata?.content?.content &&
        renderPageContent(page.metadata?.content?.content, true).contentHTML,
      summary: page.metadata?.content?.summary,
      url: `/api/redirection?characterId=${page.characterId}&noteId=${page.noteId}`,
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
}

export const parsePost = (post: ExpandedNote, withTwitter?: boolean) => {
  let twitter
  if (withTwitter) {
    twitter = post.character?.metadata?.content?.connected_accounts
      ?.find((account) => account?.endsWith?.("@twitter"))
      ?.match(/csb:\/\/account:([^@]+)@twitter/)?.[1]
  }
  return {
    id: `${post.characterId}-${post.noteId}`,
    title: `${post.metadata?.content?.title}${
      withTwitter && twitter ? ` by @${twitter}` : ""
    }`,
    summary: post.metadata?.content?.summary,
    url: `${SITE_URL}/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`,
    image: post.metadata?.content?.cover,
    date_published: post.createdAt,
    date_modified: post.updatedAt,
    tags: post.metadata?.content?.tags,
    author: {
      name: post.character?.metadata?.content?.name || post.character?.handle,
      url: `${SITE_URL}/api/redirection?characterId=${post.characterId}`,
      handle: post.character?.handle,
    },
  }
}

export const setHeader = (ctx: GetServerSidePropsContext, isXml?: boolean) => {
  ctx.res.setHeader(
    "Content-Type",
    ctx.query.format === "xml" || isXml
      ? "application/xml; charset=utf-8"
      : "application/feed+json; charset=utf-8",
  )
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  ctx.res.setHeader("Cache-Control", "public, max-age=1800")
}
