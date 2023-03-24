import { ExpandedNote } from "~/lib/types"
import { indexer } from "@crossbell/indexer"

const expandPage = async (page: ExpandedNote, useStat?: boolean) => {
  if (page.metadata?.content) {
    if (page.metadata?.content?.content) {
      const { renderPageContent } = await import("~/markdown")
      const rendered = renderPageContent(page.metadata.content.content, true)
      if (!page.metadata.content.summary) {
        page.metadata.content.summary = rendered.excerpt
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
  }

  return page
}

export async function getFeed({
  type,
  cursor,
  limit = 10,
  characterId,
}: {
  type?: "latest" | "recommend" | "following"
  cursor?: string
  limit?: number
  characterId?: number
}) {
  switch (type) {
    case "latest":
      const result = await indexer.getNotes({
        sources: "xlog",
        tags: ["post"],
        limit,
        cursor,
        includeCharacter: true,
      })

      const list = await Promise.all(
        result.list.map(async (page: any) => {
          return expandPage(page, true)
        }),
      )

      return {
        list,
        cursor: result.cursor,
        count: result.count,
      }
    case "following":
      if (!characterId) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      } else {
        const result = await indexer.getFollowingFeedsOfCharacter(characterId, {
          // sources: "xlog",
          // tags: ["post"],
          limit: limit * 2,
          cursor,
          type: ["POST_NOTE"],
        })

        const list = await Promise.all(
          result.list
            .filter((page) => {
              return (
                page.note?.metadata?.content?.sources?.includes("xlog") &&
                page.note?.metadata?.content?.tags?.includes("post")
              )
            })
            .map(async (page: any) => {
              return expandPage(page.note, true)
            }),
        )

        return {
          list,
          cursor: result.cursor,
          count: result.count,
        }
      }
  }
}
