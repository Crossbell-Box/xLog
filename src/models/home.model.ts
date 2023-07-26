import type { NoteEntity } from "crossbell"
import dayjs from "dayjs"

import { indexer } from "@crossbell/indexer"
import { gql } from "@urql/core"

import countCharacters from "~/lib/character-count"
import { expandCrossbellNote } from "~/lib/expand-unit"
import { ExpandedNote } from "~/lib/types"
import { client } from "~/queries/graphql"

import filter from "../../data/filter.json"
import topics from "../../data/topics.json"

export type FeedType =
  | "latest"
  | "following"
  | "topic"
  | "hottest"
  | "search"
  | "tag"
  | "comments"
  | "featured"

export type SearchType = "latest" | "hottest"

export async function getFeed({
  type,
  cursor,
  limit = 12,
  characterId,
  daysInterval,
  searchKeyword,
  searchType,
  tag,
  useHTML,
  topic,
}: {
  type?: FeedType
  cursor?: string
  limit?: number
  characterId?: number
  daysInterval?: number
  searchKeyword?: string
  searchType?: SearchType
  tag?: string
  useHTML?: boolean
  topic?: string
}) {
  if (type === "search" && !searchKeyword) {
    type = "latest"
  }

  const cursorQuery = cursor
    ? `
    cursor: {
      note_characterId_noteId_unique: {
        characterId: ${cursor.split("_")[0]},
        noteId: ${cursor.split("_")[1]}
      },
    },
  `
    : ""
  const resultFields = `
    characterId
    noteId
    character {
      handle
      characterId
      metadata {
        content
      }
    }
    createdAt
    metadata {
      uri
      content
    }
  `

  let resultAll: {
    list: ExpandedNote[]
    cursor?: string | null
    count?: number
  } = {
    list: [],
    count: 0,
  }

  switch (type) {
    case "latest": {
      const result = await client
        .query(
          gql`
            query getNotes($filter: [Int!], $limit: Int) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    content: {
                      path: "sources",
                      array_contains: "xlog"
                    },
                    NOT: [{
                      content: {
                        path: "tags",
                        array_starts_with: "comment"
                      }
                    }]
                  },
                },
                orderBy: [{ createdAt: desc }],
                take: $limit,
                ${cursorQuery}
              ) {
                ${resultFields}
              }
            }
          `,
          {
            filter: filter.latest,
            limit,
          },
        )
        .toPromise()

      const list = await Promise.all(
        result?.data?.notes.map((page: NoteEntity) =>
          expandCrossbellNote({
            note: page,
            useScore: true,
            useHTML,
          }),
        ),
      )

      resultAll = {
        list,
        cursor: list?.length
          ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
              ?.noteId}`
          : undefined,
        count: list?.length || 0,
      }
      break
    }
    case "comments": {
      const result = await client
        .query(
          gql`
            query getNotes($filter: [Int!], $limit: Int) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    AND: [{
                      content: {
                        path: "sources",
                        array_contains: "xlog"
                      }
                    }, {
                      content: {
                        path: "tags",
                        array_starts_with: "comment"
                      }
                    }]
                  },
                },
                orderBy: [{ createdAt: desc }],
                take: $limit,
                ${cursorQuery}
              ) {
                ${resultFields}
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
            }
          `,
          {
            filter: filter.latest,
            limit,
          },
        )
        .toPromise()

      const list = await Promise.all(
        result?.data?.notes
          .filter((page: NoteEntity) => {
            return !page.toNote?.metadata?.content?.tags?.includes("comment")
          })
          .map(async (page: NoteEntity) => {
            const expand = await expandCrossbellNote({
              note: page,
              useHTML,
            })
            if (expand.toNote) {
              expand.toNote = await expandCrossbellNote({
                note: expand.toNote,
                useHTML,
              })
            }
            return expand
          }),
      )

      resultAll = {
        list,
        cursor: list?.length
          ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
              ?.noteId}`
          : undefined,
        count: list?.length || 0,
      }
      break
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
          result.list.map((page: NoteEntity) =>
            expandCrossbellNote({
              note: page,
              useHTML,
            }),
          ),
        )

        resultAll = {
          list,
          cursor: result.cursor,
          count: result.count,
        }
        break
      }
    }
    case "topic": {
      const info = topics.find((t) => t.name === topic)

      if (!info) {
        return {
          list: [],
          cursor: "",
          count: 0,
        }
      }

      const includeString = [
        ...(info.includeKeywords?.map(
          (topicIncludeKeyword) =>
            `{ content: { path: "title", string_contains: "${topicIncludeKeyword}" } }, { content: { path: "content", string_contains: "${topicIncludeKeyword}" } }`,
        ) || []),
        ...(info.includeTags?.map(
          (topicIncludeTag) =>
            `{ content: { path: "tags", array_contains: "${topicIncludeTag}" } },`,
        ) || []),
      ].join("\n")

      if (info.notes) {
        const orString = info.notes
          .map(
            (note) =>
              `{ noteId: { equals: ${
                note.split("-")[1]
              } }, characterId: { equals: ${note.split("-")[0]}}},`,
          )
          .join("\n")
        const result = await client
          .query(
            gql`
              query getNotes($filter: [Int!], $limit: Int) {
                notes(
                  where: {
                    characterId: {
                      notIn: $filter
                    },
                    deleted: {
                      equals: false,
                    },
                    metadata: {
                      AND: [
                        {
                          content: {
                            path: "sources",
                            array_contains: "xlog"
                          },
                        },
                        {
                          content: {
                            path: "tags",
                            array_contains: "post"
                          }
                        }
                      ]
                    },
                    OR: [
                      {
                        metadata: {
                          OR: [
                            ${includeString}
                          ]
                        }
                      },
                      {
                        OR: [
                          ${orString}
                        ]
                      }
                    ]
                  },
                  orderBy: [{ createdAt: desc }],
                  take: $limit,
                  ${cursorQuery}
                ) {
                  ${resultFields}
                }
              }
            `,
            {
              filter: filter.latest,
              limit,
            },
          )
          .toPromise()

        const list = await Promise.all(
          result?.data?.notes.map((page: NoteEntity) =>
            expandCrossbellNote({
              note: page,
              useHTML,
            }),
          ),
        )

        resultAll = {
          list: list,
          cursor: list?.length
            ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
                ?.noteId}`
            : undefined,
          count: list?.length || 0,
        }
        break
      } else {
        const excludeString = [
          ...(info.excludeKeywords?.map(
            (topicExcludeKeyword) =>
              `{ NOT: { content: { path: "content", string_contains: "${topicExcludeKeyword}" } } },`,
          ) || []),
        ].join("\n")
        const result = await client
          .query(
            gql`
              query getNotes($filter: [Int!], $limit: Int) {
                notes(
                  where: {
                    characterId: {
                      notIn: $filter
                    },
                    deleted: {
                      equals: false,
                    },
                    metadata: {
                      AND: [
                        {
                          content: {
                            path: "sources",
                            array_contains: "xlog"
                          },
                        },
                        {
                          content: {
                            path: "tags",
                            array_contains: "post"
                          }
                        },
                        ${excludeString},
                        {
                          OR: [
                            ${includeString}
                          ]
                        }
                      ]
                    },
                  },
                  orderBy: [{ createdAt: desc }],
                  take: $limit,
                  ${cursorQuery}
                ) {
                  ${resultFields}
                }
              }
            `,
            {
              filter: filter.latest,
              limit,
            },
          )
          .toPromise()

        const list = await Promise.all(
          result?.data?.notes.map((page: NoteEntity) =>
            expandCrossbellNote({
              note: page,
              useHTML,
            }),
          ),
        )

        resultAll = {
          list: list,
          cursor: list?.length
            ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
                ?.noteId}`
            : undefined,
          count: list?.length || 0,
        }
        break
      }
    }
    case "hottest": {
      let time
      if (daysInterval) {
        time = dayjs().subtract(daysInterval, "day").toISOString()
      }

      const result = await client
        .query(
          gql`
            query getNotes($filter: [Int!]) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  ${
                    time
                      ? `
                  createdAt: {
                    gt: "${time}"
                  },
                  `
                      : ``
                  }
                  stat: {
                    viewDetailCount: {
                      gt: 0
                    },
                  },
                  metadata: {
                    AND: [{
                      content: {
                        path: "sources",
                        array_contains: "xlog"
                      },
                    }, {
                      content: {
                        path: "tags",
                        array_contains: "post"
                      }
                    }]
                  },
                },
                take: 40,
                orderBy: {
                  stat: {
                    viewDetailCount: desc
                  }
                },
              ) {
                stat {
                  viewDetailCount
                }
                ${resultFields}
              }
            }
          `,
          {
            filter: filter.latest,
          },
        )
        .toPromise()

      let list: ExpandedNote[] = await Promise.all(
        result?.data?.notes.map(
          async (
            page: NoteEntity & {
              stat: {
                viewDetailCount: number
                hotScore?: number
              }
            },
          ) => {
            if (daysInterval) {
              const secondAgo = dayjs().diff(dayjs(page.createdAt), "second")
              page.stat.hotScore =
                page.stat.viewDetailCount / Math.max(Math.log10(secondAgo), 1)
            }

            const expand = await expandCrossbellNote({
              note: page,
              useHTML,
            })
            return expand
          },
        ),
      )

      if (daysInterval) {
        list = list
          .sort((a, b) => {
            if (a.stat?.hotScore && b.stat?.hotScore) {
              return b.stat.hotScore - a.stat.hotScore
            } else {
              return 0
            }
          })
          .slice(0, 24)
      }

      resultAll = {
        list: list,
        cursor: "",
        count: list?.length || 0,
      }
      break
    }
    case "featured": {
      const result = await client
        .query(
          gql`
            query getNotes($filter: [Int!], $limit: Int) {
              notes(
                where: {
                  characterId: {
                    notIn: $filter
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    content: {
                      path: "sources",
                      array_contains: "xlog"
                    },
                    NOT: [{
                      content: {
                        path: "tags",
                        array_starts_with: "comment"
                      }
                    }]
                  },
                  OR: [
                    # With over 30 views
                    {
                      stat: {
                        viewDetailCount: {
                          gt: 30
                        },
                      },
                    },
                    # Or have received comments
                    {
                      fromNotes: {
                        some: {
                          deleted: {
                            equals: false,
                          }
                        }
                      }
                    },
                    # Or have received tips
                    {
                      receivedTips: {
                        some: {
                          blockNumber: {
                            gt: 0
                          }
                        }
                      }
                    }
                  ]
                },
                orderBy: [{ createdAt: desc }],
                take: $limit,
                ${cursorQuery}
              ) {
                stat {
                  viewDetailCount
                }
                ${resultFields}
              }
            }
          `,
          {
            filter: filter.latest,
            limit,
          },
        )
        .toPromise()

      let list = await Promise.all(
        result?.data?.notes.map(
          async (
            page: NoteEntity & {
              stat: {
                viewDetailCount: number
                hotScore?: number
              }
            },
          ) => {
            const secondAgo = dayjs().diff(dayjs(page.createdAt), "second")
            page.stat.hotScore =
              page.stat.viewDetailCount / Math.max(Math.log10(secondAgo), 1)

            const expand = await expandCrossbellNote({
              note: page,
              useHTML,
            })
            return expand
          },
        ),
      )

      const cursor = list?.length
        ? `${list[list.length - 1]?.characterId}_${list[list.length - 1]
            ?.noteId}`
        : undefined

      list = list.sort((a, b) => {
        if (a.stat?.hotScore && b.stat?.hotScore) {
          return b.stat.hotScore - a.stat.hotScore
        } else {
          return 0
        }
      })

      resultAll = {
        list,
        cursor,
        count: list?.length || 0,
      }
      break
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
        result.list.map((page: NoteEntity) =>
          expandCrossbellNote({
            note: page,
            useStat: false,
            useScore: false,
            keyword: searchKeyword,
            useHTML,
          }),
        ),
      )

      resultAll = {
        list,
        cursor: result.cursor,
        count: result.count,
      }
      break
    }
    case "tag": {
      if (!tag) {
        resultAll = {
          list: [],
          cursor: "",
          count: 0,
        }
        break
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
        result.list.map((page: NoteEntity) =>
          expandCrossbellNote({
            note: page,
            useStat: false,
            useScore: true,
            useHTML,
          }),
        ),
      )

      resultAll = {
        list,
        cursor: result.cursor,
        count: result.count,
      }
      break
    }
  }

  resultAll.list = resultAll.list
    .filter(
      (post) =>
        countCharacters(post?.metadata?.content?.content || "") >
          (post?.metadata?.content?.tags?.[0] === "comment" ? 6 : 300) &&
        !(
          new Date(post.metadata?.content?.date_published || "") > new Date()
        ) &&
        !post.toNote?.metadata?.content?.tags?.includes("comment"),
    )
    .map((post) => {
      delete post.metadata?.content.content
      return post
    })

  return resultAll
}

export const getShowcase = async () => {
  const oneMonthAgo = dayjs().subtract(10, "day").toISOString()

  const listResponse = await client
    .query(
      gql`
        query getCharacters($filter: [Int!]) {
          characters(
            where: {
              characterId: { notIn: $filter }
              notes: {
                some: {
                  stat: { viewDetailCount: { gte: 300 } }
                  metadata: {
                    AND: [
                      { content: { path: "sources", array_contains: "xlog" } }
                      { content: { path: "tags", array_contains: "post" } }
                    ]
                  }
                }
              }
            }
          ) {
            characterId
          }
        }
      `,
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
      gql`
        query getCharacters($identities: [Int!]) {
          characters(
            where: {
              characterId: {
                in: $identities
              }
            },
            orderBy: [{
              updatedAt: desc
            }]
          ) {
            handle
            characterId
            metadata {
              uri
              content
            }
          }
          notes(
            where: {
              characterId: {
                in: $identities
              },
              createdAt: {
                gt: "${oneMonthAgo}"
              },
              metadata: {
                content: {
                  path: "sources",
                  array_contains: "xlog"
                }
              }
            },
            orderBy: [{
              updatedAt: desc
            }]
          ) {
            characterId
            createdAt
          }
        }
      `,
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
    .slice(0, 50)

  return list
}
