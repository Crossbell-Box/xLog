import { ExpandedNote } from "~/lib/types"
import { indexer } from "@crossbell/indexer"
import { toCid } from "~/lib/ipfs-parser"
import { createClient } from "@urql/core"
import { SITE_URL, SCORE_API_DOMAIN } from "~/lib/env"

const expandPage = async (
  page: ExpandedNote,
  useStat?: boolean,
  useScore?: boolean,
) => {
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

export async function getFeed({
  type,
  cursor,
  limit = 10,
  characterId,
  noteIds,
}: {
  type?: "latest" | "recommend" | "following" | "topic"
  cursor?: string
  limit?: number
  characterId?: number
  noteIds?: string[]
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
          return expandPage(page, false, true)
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
              return expandPage(page.note)
            }),
        )

        return {
          list,
          cursor: result.cursor,
          count: result.count,
        }
      }
    case "topic":
      if (!noteIds) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      }
      const client = createClient({
        url: "https://indexer.crossbell.io/v1/graphql",
      })

      const orString = noteIds
        .map(
          (note) =>
            `{ noteId: { equals: ${
              note.split("-")[1]
            } }, characterId: { equals: ${note.split("-")[0]}}},`,
        )
        .join("\n")
      const topicResult = await client
        .query(
          `
            query getNotes {
              notes(
                where: {
                  OR: [
                    ${orString}
                  ]
                },
                orderBy: [{ createdAt: desc }],
                take: 1000,
              ) {
                characterId
                noteId
                character {
                  handle
                  metadata {
                    content
                  }
                }
                createdAt
                metadata {
                  uri
                  content
                }
              }
            }`,
          {},
        )
        .toPromise()

      const topicList = await Promise.all(
        topicResult?.data?.notes.map(async (page: any) => {
          return expandPage(page)
        }),
      )

      return {
        list: topicList,
        cursor: "",
        count: topicList?.length || 0,
      }
  }
}
