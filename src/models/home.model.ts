import { ExpandedNote } from "~/lib/types"
import { indexer } from "@crossbell/indexer"
import { toCid } from "~/lib/ipfs-parser"
import { createClient, cacheExchange, fetchExchange } from "@urql/core"
import { SITE_URL, SCORE_API_DOMAIN } from "~/lib/env"
import dayjs from "dayjs"

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

export type FeedType = "latest" | "following" | "topic" | "hot"

export async function getFeed({
  type,
  cursor,
  limit = 10,
  characterId,
  noteIds,
  daysInterval,
}: {
  type?: FeedType
  cursor?: string
  limit?: number
  characterId?: number
  noteIds?: string[]
  daysInterval?: number
}) {
  switch (type) {
    case "latest": {
      const result = await indexer.getNotes({
        sources: "xlog",
        tags: ["post"],
        limit,
        cursor,
        includeCharacter: true,
      })

      const list = await Promise.all(
        result.list.map(async (page: any) => {
          return await expandPage(page, false, true)
        }),
      )

      return {
        list,
        cursor: result.cursor,
        count: result.count,
      }
    }
    case "following": {
      if (!characterId) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      } else {
        const result = await indexer.getNotesOfCharacterFollowing(characterId, {
          sources: "xlog",
          tags: ["post"],
          limit: limit,
          cursor,
          includeCharacter: true,
        })

        const list = await Promise.all(
          result.list.map(async (page: any) => {
            return await expandPage(page)
          }),
        )

        return {
          list,
          cursor: result.cursor,
          count: result.count,
        }
      }
    }
    case "topic": {
      if (!noteIds) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      }
      const client = createClient({
        url: "https://indexer.crossbell.io/v1/graphql",
        exchanges: [cacheExchange, fetchExchange],
      })

      const orString = noteIds
        .map(
          (note) =>
            `{ noteId: { equals: ${
              note.split("-")[1]
            } }, characterId: { equals: ${note.split("-")[0]}}},`,
        )
        .join("\n")
      const result = await client
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

      const list = await Promise.all(
        result?.data?.notes.map(async (page: any) => {
          return await expandPage(page)
        }),
      )

      return {
        list: list,
        cursor: "",
        count: list?.length || 0,
      }
    }
    case "hot": {
      const client = createClient({
        url: "https://indexer.crossbell.io/v1/graphql",
        exchanges: [cacheExchange, fetchExchange],
      })

      let time
      if (daysInterval) {
        time = dayjs().subtract(daysInterval, "day").toISOString()
      }

      const result = await client
        .query(
          `
              query getNotes {
                notes(
                  where: {
                    ${time ? `createdAt: { gt: "${time}" },` : ``}
                    stat: { is: { viewDetailCount: { gt: 0 } } },
                    metadata: { is: { content: { path: "sources", array_contains: "xlog" }, AND: { content: { path: "tags", array_contains: "post" } } } }
                  },
                  orderBy: { stat: { viewDetailCount: desc } },
                  take: 50,
                ) {
                  stat {
                    viewDetailCount
                  }
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

      let list: ExpandedNote[] = await Promise.all(
        result?.data?.notes.map(async (page: any) => {
          if (daysInterval) {
            const secondAgo = dayjs().diff(dayjs(page.createdAt), "second")
            page.stat.hotScore =
              page.stat.viewDetailCount / Math.max(Math.log10(secondAgo), 1)
          }

          return await expandPage(page)
        }),
      )

      if (daysInterval) {
        list = list.sort((a, b) => {
          if (a.stat?.hotScore && b.stat?.hotScore) {
            return b.stat.hotScore - a.stat.hotScore
          } else {
            return 0
          }
        })
      }

      return {
        list: list,
        cursor: "",
        count: list?.length || 0,
      }
    }
  }
}
