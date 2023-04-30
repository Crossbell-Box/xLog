import { CharacterEntity } from "crossbell.js"
import { nanoid } from "nanoid"

import { SCORE_API_DOMAIN, SITE_URL } from "~/lib/env"
import { toCid, toGateway } from "~/lib/ipfs-parser"
import { ExpandedCharacter, ExpandedNote, Note } from "~/lib/types"

export const expandUnidataNote = async (page: Note, useStat?: boolean) => {
  if (page.body?.content && page.body?.mime_type === "text/markdown") {
    const { renderPageContent } = await import("~/markdown")
    const rendered = renderPageContent(page.body.content, true)
    page.body = {
      content: page.body.content,
      mime_type: "text/markdown",
    }
    if (!page.summary) {
      page.summary = {
        content: rendered.excerpt,
        mime_type: "text/html",
      }
    }
    page.cover = rendered.cover
    page.audio = rendered.audio
    if (page.metadata) {
      page.metadata.frontMatter = rendered.frontMatter
    }
  }
  page.slug = encodeURIComponent(
    page.attributes?.find((a) => a.trait_type === "xlog_slug")?.value ||
      page.metadata?.raw?._xlog_slug ||
      page.metadata?.raw?._crosslog_slug ||
      "",
  )
  delete page.metadata?.raw

  if (useStat) {
    const stat = await (
      await fetch(
        `https://indexer.crossbell.io/v1/stat/notes/${page.id.replace(
          "-",
          "/",
        )}`,
      )
    ).json()
    page.views = stat.viewDetailCount
  }

  return page
}

export const expandCrossbellNote = async (
  page: ExpandedNote,
  useStat?: boolean,
  useScore?: boolean,
  keyword?: string,
) => {
  if (page.metadata?.content) {
    if (page.metadata?.content?.content) {
      const { renderPageContent } = await import("~/markdown")
      const rendered = renderPageContent(page.metadata.content.content, true)
      if (keyword) {
        const position = page.metadata.content.content
          .toLowerCase()
          .indexOf(keyword.toLowerCase())
        page.metadata.content.summary = `...${page.metadata.content.content.slice(
          position - 10,
          position + 100,
        )}`
      } else {
        if (!page.metadata.content.summary) {
          page.metadata.content.summary = rendered.excerpt
        }
      }
      page.metadata.content.cover = rendered.cover
      if (page.metadata) {
        page.metadata.content.frontMatter = rendered.frontMatter
      }
    }
    page.metadata.content.slug = encodeURIComponent(
      page.metadata.content.attributes?.find(
        (a) => a.trait_type === "xlog_slug",
      )?.value || "",
    )

    if (useStat) {
      const stat = await (
        await fetch(
          `https://indexer.crossbell.io/v1/stat/notes/${page.characterId}/${page.noteId}`,
        )
      ).json()
      page.metadata.content.views = stat.viewDetailCount
    }

    if (useScore) {
      try {
        const score = (
          await (
            await fetch(
              `${SCORE_API_DOMAIN || SITE_URL}/api/score?cid=${toCid(
                page.metadata?.uri || "",
              )}`,
            )
          ).json()
        ).data
        page.metadata.content.score = score
      } catch (e) {
        // do nothing
      }
    }
  }

  return page
}

export const expandCrossbellCharacter = (site: CharacterEntity) => {
  const expandedCharacter: ExpandedCharacter = Object.assign(
    {
      metadata: {
        content: {},
      },
    },
    site,
  )

  expandedCharacter.metadata.content.navigation = JSON.parse(
    (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_navigation",
    )?.value as string) || "null",
  ) || [{ id: nanoid(), label: "Archives", url: "/archives" }]
  expandedCharacter.metadata.content.css =
    expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_css",
    )?.value as string
  expandedCharacter.metadata.content.ga =
    (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_ga",
    )?.value as string) || ""
  expandedCharacter.metadata.content.custom_domain =
    (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_custom_domain",
    )?.value as string) || ""
  expandedCharacter.metadata.content.name =
    expandedCharacter.metadata.content.name || expandedCharacter.handle

  if (expandedCharacter.metadata.content.avatars) {
    expandedCharacter.metadata.content.avatars =
      expandedCharacter.metadata.content.avatars.map((avatar) =>
        toGateway(avatar),
      )
  }
  if (expandedCharacter.metadata.content.banners) {
    expandedCharacter.metadata.content.banners.map((banner) => {
      banner.address = toGateway(banner.address)
      return banner
    })
  }

  return expandedCharacter
}
