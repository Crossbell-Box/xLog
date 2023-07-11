import dayjs from "dayjs"

import { indexer } from "@crossbell/indexer"

import { expandCrossbellNote } from "~/lib/expand-unit"
import { ExpandedNote } from "~/lib/types"
import { client } from "~/queries/graphql"

import filter from "../../data/filter.json"

export type FeedType =
  | "latest"
  | "following"
  | "topic"
  | "hottest"
  | "search"
  | "tag"
export type SearchType = "latest" | "hottest"

export async function getFeed({
  type,
  cursor,
  limit = 30,
  characterId,
  noteIds,
  daysInterval,
  searchKeyword,
  searchType,
  tag,
  useHTML,
  topicIncludeKeywords,
  topicIncludeTags,
}: {
  type?: FeedType
  cursor?: string
  limit?: number
  characterId?: number
  noteIds?: string[]
  daysInterval?: number
  searchKeyword?: string
  searchType?: SearchType
  tag?: string
  useHTML?: boolean
  topicIncludeKeywords?: string[]
  topicIncludeTags?: string[]
}) {
  if (type === "search" && !searchKeyword) {
    type = "latest"
  }
  switch (type) {
    case "latest": {
      const result = await client
        .query(
          `
          query getNotes($filter: [Int!]) {
            notes(
              where: {
                characterId: {
                  notIn: $filter
                }
                metadata: {
                  AND: [{
                    content: {
                      path: "sources",
                      array_contains: "xlog"
                    }
                  }, {
                    OR: [{
                      content: {
                        path: "tags",
                        array_starts_with: "page"
                      }
                    }, {
                      content: {
                        path: "tags",
                        array_starts_with: "post"
                      }
                    }]
                  }]
                },
              },
              orderBy: [{ createdAt: desc }],
              take: ${limit},
              ${
                cursor
                  ? `
              cursor: {
                note_characterId_noteId_unique: {
                  characterId: ${cursor.split("_")[0]},
                  noteId: ${cursor.split("_")[1]}
                },
              },`
                  : ""
              }
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
              toNote {
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
            }
          }`,
          {
            filter: filter.latest,
          },
        )
        .toPromise()

      const list = await Promise.all(
        result?.data?.notes
          .filter((page: any) => {
            return !(
              page.metadata?.content?.tags?.includes("comment") &&
              page.toNote?.metadata?.content?.tags?.includes("comment")
            )
          })
          .map(async (page: any) => {
            const isComment = page.metadata?.content?.tags?.includes("comment")
            const expand = await expandCrossbellNote({
              note: page,
              useScore: !isComment,
              useHTML,
            })
            if (isComment && expand.toNote) {
              expand.toNote = await expandCrossbellNote({
                note: expand.toNote,
                useHTML,
              })
            }
            delete expand.metadata?.content.content
            return expand
          }),
      )

      return {
        list,
        cursor: list?.length
          ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
              ?.noteId}`
          : undefined,
        count: list?.length || 0,
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
        const result = await indexer.note.getManyOfCharacterFollowing(
          characterId,
          {
            sources: "xlog",
            tags: ["post"],
            limit: limit,
            cursor,
            includeCharacter: true,
          },
        )

        const list = await Promise.all(
          result.list.map(async (page: any) => {
            const expand = await expandCrossbellNote({
              note: page,
              useHTML,
            })
            delete expand.metadata?.content.content
            return expand
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
      if (!topicIncludeKeywords && !topicIncludeTags && !noteIds) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      }

      const includeString = [
        ...(topicIncludeKeywords?.map(
          (topicIncludeKeyword) =>
            `{ content: { path: "title", string_contains: "${topicIncludeKeyword}" } }, { content: { path: "content", string_contains: "${topicIncludeKeyword}" } }`,
        ) || []),
        ...(topicIncludeTags?.map(
          (topicIncludeTag) =>
            `{ content: { path: "tags", array_contains: "${topicIncludeTag}" } },`,
        ) || []),
      ].join("\n")

      if (noteIds) {
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
            query getNotes($filter: [Int!]) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  metadata: {
                    content: {
                      path: "sources",
                      array_contains: "xlog"
                    }
                  }
                  OR: [
                    {
                      metadata: {
                        content: {
                          path: "sources",
                          array_contains: "xlog"
                        },
                        AND: [{
                          content: {
                            path: "tags",
                            array_contains: "post"
                          }
                        }, {
                          OR: [
                            ${includeString}
                          ]
                        }]
                      }
                    }
                    {
                      OR: [
                        ${orString}
                      ]
                    }
                  ]
                },
                orderBy: [{ createdAt: desc }],
                take: ${limit},
                ${
                  cursor
                    ? `
                cursor: {
                  note_characterId_noteId_unique: {
                    characterId: ${cursor.split("_")[0]},
                    noteId: ${cursor.split("_")[1]}
                  },
                },`
                    : ""
                }
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
            {
              filter: filter.latest,
            },
          )
          .toPromise()

        const list = await Promise.all(
          result?.data?.notes.map(async (page: any) => {
            const expand = await expandCrossbellNote({
              note: page,
              useHTML,
            })
            delete expand.metadata?.content.content
            return expand
          }),
        )

        return {
          list: list,
          cursor: list?.length
            ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
                ?.noteId}`
            : undefined,
          count: list?.length || 0,
        }
      } else {
        const result = await client
          .query(
            `
            query getNotes($filter: [Int!]) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  metadata: {
                    content: {
                      path: "sources",
                      array_contains: "xlog"
                    },
                    AND: [{
                      content: {
                        path: "tags",
                        array_contains: "post"
                      }
                    }, {
                      OR: [
                        ${includeString}
                      ]
                    }]
                  },
                },
                orderBy: [{ createdAt: desc }],
                take: ${limit},
                ${
                  cursor
                    ? `
                cursor: {
                  note_characterId_noteId_unique: {
                    characterId: ${cursor.split("_")[0]},
                    noteId: ${cursor.split("_")[1]}
                  },
                },`
                    : ""
                }
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
            {
              filter: filter.latest,
            },
          )
          .toPromise()

        const list = await Promise.all(
          result?.data?.notes.map(async (page: any) => {
            const expand = await expandCrossbellNote({
              note: page,
              useHTML,
            })
            delete expand.metadata?.content.content
            return expand
          }),
        )

        return {
          list: list,
          cursor: list?.length
            ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
                ?.noteId}`
            : undefined,
          count: list?.length || 0,
        }
      }
    }
    case "hottest": {
      let time
      if (daysInterval) {
        time = dayjs().subtract(daysInterval, "day").toISOString()
      }

      const result = await client
        .query(
          `
          query getNotes($filter: [Int!]) {
            notes(
              where: {
                characterId: {
                  notIn: $filter
                },
                ${time ? `createdAt: { gt: "${time}" },` : ``}
                stat: { viewDetailCount: { gt: 0 } },
                metadata: { content: { path: "sources", array_contains: "xlog" }, AND: { content: { path: "tags", array_contains: "post" } } }
              },
              orderBy: { stat: { viewDetailCount: desc } },
              take: 25,
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
          {
            filter: filter.latest,
          },
        )
        .toPromise()

      let list: ExpandedNote[] = await Promise.all(
        result?.data?.notes.map(async (page: any) => {
          if (daysInterval) {
            const secondAgo = dayjs().diff(dayjs(page.createdAt), "second")
            page.stat.hotScore =
              page.stat.viewDetailCount / Math.max(Math.log10(secondAgo), 1)
          }

          const expand = await expandCrossbellNote({
            note: page,
            useHTML,
          })
          delete expand.metadata?.content.content
          return expand
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
      const result = await indexer.search.notes(searchKeyword!, {
        sources: ["xlog"],
        tags: ["post"],
        limit: limit,
        cursor,
        includeCharacterMetadata: true,
        orderBy: searchType === "hottest" ? "viewCount" : "createdAt",
      })

      const list = await Promise.all(
        result.list.map(async (page: any) => {
          const expand = await expandCrossbellNote({
            note: page,
            useStat: false,
            useScore: false,
            keyword: searchKeyword,
            useHTML,
          })
          delete expand.metadata?.content.content
          return expand
        }),
      )

      return {
        list,
        cursor: result.cursor,
        count: result.count,
      }
    }
    case "tag": {
      if (!tag) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      }

      let result = await indexer.note.getMany({
        sources: "xlog",
        tags: ["post", tag],
        limit,
        cursor,
        includeCharacter: true,
        excludeCharacterId: filter.latest,
      } as any)

      const list = await Promise.all(
        result.list.map(async (page: any) => {
          const expand = await expandCrossbellNote({
            note: page,
            useStat: false,
            useScore: true,
            useHTML,
          })
          delete expand.metadata?.content.content
          return expand
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

export const getShowcase = async () => {
  const oneMonthAgo = dayjs().subtract(10, "day").toISOString()

  const listResponse = await client
    .query(
      `
        query getCharacters($filter: [Int!]) {
          characters(
            where: {
              characterId: {
                notIn: $filter
              }
              notes: {
                some: {
                  stat: { viewDetailCount: { gte: 100 } }
                  metadata: {
                    content: { path: "sources", array_contains: "xlog" }
                    AND: { content: { path: "tags", array_contains: "post" } }
                  }
                }
              }
            }
          ) {
            characterId
          }
        }`,
      {
        filter: filter.latest,
      },
    )
    .toPromise()
  const characterList = listResponse.data?.characters.map((c: any) =>
    parseInt(c.characterId),
  )

  const result = await client
    .query(
      `
        query getCharacters($identities: [Int!]) {
          characters( where: { characterId: { in: $identities } }, orderBy: [{ updatedAt: desc }] ) {
            handle
            characterId
            metadata {
              uri
              content
            }
          }
          notes( where: { characterId: { in: $identities }, createdAt: { gt: "${oneMonthAgo}" }, metadata: { content: { path: "sources", array_contains: "xlog" } } }, orderBy: [{ updatedAt: desc }] ) {
            characterId
            createdAt
          }
        }`,
      {
        identities: characterList,
      },
    )
    .toPromise()

  result.data?.characters?.forEach((site: any) => {
    if (site.metadata?.content) {
      site.metadata.content.name = site.metadata?.content?.name || site.handle
    } else {
      site.metadata.content = {
        name: site.handle,
      }
    }

    site.custom_domain =
      site.metadata?.content?.attributes?.find(
        (a: any) => a.trait_type === "xlog_custom_domain",
      )?.value || ""
  })

  const createdAts: {
    [key: string]: string
  } = {}
  result.data?.notes.forEach((note: any) => {
    if (!createdAts[note.characterId + ""]) {
      createdAts[note.characterId + ""] = note.createdAt
    }
  })
  const list = Object.keys(createdAts)
    .map((characterId: string) => {
      const character = result.data?.characters.find(
        (c: any) => c.characterId === characterId,
      )

      return {
        ...character,
        createdAt: createdAts[characterId],
      }
    })
    .sort((a: any, b: any) => {
      return b.createdAt > a.createdAt ? 1 : -1
    })
    .slice(0, 100)

  return list
}
