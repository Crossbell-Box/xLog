import { Note, Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import { toGateway } from "~/lib/ipfs-parser"
import { SITE_URL, SCORE_API_DOMAIN } from "~/lib/env"
import { toCid } from "~/lib/ipfs-parser"
import { ExpandedNote } from "~/lib/types"

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

export const expandUnidataProfile = (site: Profile) => {
  site.navigation = JSON.parse(
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_navigation",
    )?.value || "null",
  ) ||
    site.metadata?.raw?.["_xlog_navigation"] ||
    site.metadata?.raw?.["_crosslog_navigation"] || [
      { id: nanoid(), label: "Archives", url: "/archives" },
    ]
  site.css =
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_css",
    )?.value ||
    site.metadata?.raw?.["_xlog_css"] ||
    site.metadata?.raw?.["_crosslog_css"] ||
    ""
  site.ga =
    site.metadata?.raw?.attributes?.find((a: any) => a.trait_type === "xlog_ga")
      ?.value || ""
  site.custom_domain =
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_custom_domain",
    )?.value || ""
  site.name = site.name || site.username
  site.description = site.bio

  if (site.avatars) {
    site.avatars = site.avatars.map((avatar) => toGateway(avatar))
  }
  if (site.banners) {
    site.banners.map((banner) => {
      banner.address = toGateway(banner.address)
      return banner
    })
  }
  delete site.metadata?.raw

  return site
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
