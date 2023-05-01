import { CharacterEntity, NoteEntity } from "crossbell.js"
import { nanoid } from "nanoid"

import { SCORE_API_DOMAIN, SITE_URL } from "~/lib/env"
import { toCid, toGateway } from "~/lib/ipfs-parser"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

export const expandCrossbellNote = async (
  note: NoteEntity,
  useStat?: boolean,
  useScore?: boolean,
  keyword?: string,
) => {
  const expandedNote: ExpandedNote = Object.assign(
    {
      metadata: {
        content: {},
      },
    },
    note,
  )

  if (expandedNote.metadata?.content) {
    if (expandedNote.metadata?.content?.content) {
      const { renderPageContent } = await import("~/markdown")
      const rendered = renderPageContent(
        expandedNote.metadata.content.content,
        true,
      )
      if (keyword) {
        const position = expandedNote.metadata.content.content
          .toLowerCase()
          .indexOf(keyword.toLowerCase())
        expandedNote.metadata.content.summary = `...${expandedNote.metadata.content.content.slice(
          position - 10,
          position + 100,
        )}`
      } else {
        if (!expandedNote.metadata.content.summary) {
          expandedNote.metadata.content.summary = rendered.excerpt
        }
      }
      expandedNote.metadata.content.cover = rendered.cover
      expandedNote.metadata.content.audio = rendered.audio
      expandedNote.metadata.content.frontMatter = rendered.frontMatter
    }
    expandedNote.metadata.content.slug = encodeURIComponent(
      expandedNote.metadata.content.attributes?.find(
        (a) => a.trait_type === "xlog_slug",
      )?.value || "",
    )

    if (useStat) {
      const stat = await (
        await fetch(
          `https://indexer.crossbell.io/v1/stat/notes/${expandedNote.characterId}/${expandedNote.noteId}`,
        )
      ).json()
      expandedNote.metadata.content.views = stat.viewDetailCount
    }

    if (useScore) {
      try {
        const score = (
          await (
            await fetch(
              `${SCORE_API_DOMAIN || SITE_URL}/api/score?cid=${toCid(
                expandedNote.metadata?.uri || "",
              )}`,
            )
          ).json()
        ).data
        expandedNote.metadata.content.score = score
      } catch (e) {
        // do nothing
      }
    }
  }

  return expandedNote
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
