import { ExpandedNote } from "~/lib/types"
import { indexer } from "@crossbell/indexer"
import { createClient, cacheExchange, fetchExchange } from "@urql/core"
import dayjs from "dayjs"
import { expandCrossbellNote } from "~/lib/expand-unit"

export type FeedType = "latest" | "following" | "topic" | "hot" | "search"
export type SearchType = "latest" | "hot"

export async function getFeed({
  type,
  cursor,
  limit = 10,
  characterId,
  noteIds,
  daysInterval,
  searchKeyword,
  searchType,
}: {
  type?: FeedType
  cursor?: string
  limit?: number
  characterId?: number
  noteIds?: string[]
  daysInterval?: number
  searchKeyword?: string
  searchType?: SearchType
}) {
  if (type === "search" && !searchKeyword) {
    type = "latest"
  }
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
          return await expandCrossbellNote(page, false, true)
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
            return await expandCrossbellNote(page)
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
          return await expandCrossbellNote(page)
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

          return await expandCrossbellNote(page)
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
    case "search": {
      const result = await indexer.searchNotes(searchKeyword!, {
        sources: ["xlog"],
        tags: ["post"],
        limit: limit,
        cursor,
        includeCharacterMetadata: true,
        orderBy: searchType === "hot" ? "viewCount" : "createdAt",
      })

      const list = await Promise.all(
        result.list.map(async (page: any) => {
          return await expandCrossbellNote(page, false, false, searchKeyword)
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
