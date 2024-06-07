import type {
  CharacterEntity,
  Contract,
  ListResponse,
  MintedNoteEntity,
  NoteEntity,
  NoteMetadata,
} from "crossbell"
import { type Address } from "viem"

import { GeneralAccount } from "@crossbell/connect-kit"
import { indexer } from "@crossbell/indexer"
import { extractCharacterAttribute } from "@crossbell/util-metadata"
import { gql } from "@urql/core"

import { RESERVED_TAGS } from "~/lib/constants"
import dayjs from "~/lib/dayjs"
import { editor2Crossbell } from "~/lib/editor-converter"
import { expandCrossbellNote } from "~/lib/expand-unit"
import { filterComment } from "~/lib/filter"
import { getNoteSlug } from "~/lib/helpers"
import { checkSlugReservedWords } from "~/lib/slug-reserved-words"
import { getKeys, getStorage } from "~/lib/storage"
import {
  ExpandedNote,
  Language,
  NoteType,
  PagesSortTypes,
  PageVisibilityEnum,
} from "~/lib/types"
import { client } from "~/queries/graphql"

import filter from "../../data/filter.json"

export const PINNED_PAGE_KEY = "xlog_pinned_page"

export async function checkPageSlug(input: {
  slug: string
  characterId?: number
  noteId?: number
}) {
  if (!input.characterId) {
    return "Character not found"
  }
  const reserved = checkSlugReservedWords(input.slug)
  if (reserved) {
    return reserved
  } else {
    try {
      const page = await getPage({
        slug: input.slug,
        characterId: input.characterId,
      })
      if (page && page.noteId !== input.noteId) {
        return `Slug "${input.slug}" has already been used`
      }
    } catch (error) {}
  }
}

export async function postNotes(
  input: {
    siteId: string
    characterId: number
    notes: NoteMetadata[]
  },
  contract?: Contract,
) {
  return contract?.note.postMany({
    notes: input.notes.map((note) => ({
      characterId: input.characterId,
      metadataOrUri: note,
    })),
  })
}

const getLocalPages = async (input: {
  characterId: number
  isPost?: boolean // In order to be compatible with old drafts
  type?: NoteType[]
  handle?: string
}) => {
  return (
    await Promise.all(
      getKeys([`draft-${input.characterId}-`, `draft-${input.handle}-`]).map(
        async (key) => {
          const page = getStorage(key)
          if (
            page.isPost === input.isPost ||
            input.type?.includes(page.type) ||
            input.type === undefined
          ) {
            const note: ExpandedNote = Object.assign(
              await expandCrossbellNote({
                note: editor2Crossbell({
                  values: page.values,
                  type: page.type,
                }),
                disableAutofill: true,
              }),
              {
                draftKey: key
                  .replace(`draft-${input.characterId}-`, "")
                  .replace(`draft-${input.handle}-${input.characterId}-`, ""), // In order to be compatible with old drafts
                local: true,
                characterId: input.characterId,
                createdAt: new Date(page.date).toISOString(),
                publishedAt: new Date(page.date).toISOString(),
                updatedAt: new Date(page.date).toISOString(),
              },
            )
            return note
          }
        },
      ),
    )
  ).filter((item): item is ExpandedNote => !!item)
}

export async function getPagesBySite(input: {
  characterId?: number
  type: NoteType | NoteType[]
  visibility?: PageVisibilityEnum
  limit?: number
  cursor?: string
  tags?: string[]
  useStat?: boolean
  useHTML?: boolean
  useImageDimensions?: boolean
  keepBody?: boolean
  handle?: string // In order to be compatible with old drafts
  skipExpansion?: boolean
  sortType?: PagesSortTypes
}) {
  if (!input.characterId) {
    return {
      count: 0,
      list: [],
      cursor: null,
    }
  }

  const visibility = input.visibility || PageVisibilityEnum.All

  let pinnedNote: NoteEntity | null = null
  let pinnedNoteId: number | null = null
  if (input.type === "post" || input.type.includes("post")) {
    if (!input.cursor) {
      pinnedNote = await getPinnedPage(input)
      pinnedNoteId = pinnedNote?.noteId || null
    } else {
      pinnedNoteId = await getPinnedPageId(input)
    }
  }

  const cursorQuery = input.cursor
    ? `
    cursor: {
      note_characterId_noteId_unique: {
        characterId: ${input.cursor.split("_")[0]},
        noteId: ${input.cursor.split("_")[1]}
      },
    },
  `
    : ""

  if (typeof input.type === "string") {
    input.type = [input.type]
  }
  const typesQuery = input.type
    ?.map(
      (tag) => `{
      content: {
        path: "tags",
        array_contains: ["${tag}"]
      }
    }`,
    )
    .join(", ")

  const contentFilterQuery = filter.post_content
    .map((content) => {
      return `{ content: { path: "content", string_contains: "${content}" } }`
    })
    .join(",\n")

  const whereQuery = `
    {
      characterId: {
        equals: $characterId
      },
      noteId: {
        not: {
          equals: $filter
        }
      },
      deleted: {
        equals: false,
      },
      metadata: {
        NOT: [${contentFilterQuery}],
        AND: [
          {
            content: {
              path: "sources",
              array_contains: "xlog"
            },
          },
          ${
            input.tags
              ? `
          {
            content: {
              path: "tags",
              array_contains: ${JSON.stringify(input.tags)}
            }
          },
          `
              : ""
          }
          {
            OR: [
              ${typesQuery}
            ]
          }
        ],
      },
    }
  `
  const limit = (input.limit || 12) - (pinnedNote ? 1 : 0)

  let orderBy
  switch (input.sortType) {
    case "hottest":
      orderBy = `{
        stat: {
          viewDetailCount:desc
        }
      }`
      break
    case "commented":
      orderBy = `{
        fromNotes: {
          _count: desc
        }
      }`
      break
    default:
      orderBy = `{
        publishedAt: {
          sort: desc
        }
      }`
      break
  }

  const { data } = await client
    .query(
      gql`
        query getNotes($characterId: Int, $filter: Int, $limit: Int) {
          noteCount(where: ${whereQuery}),
          notes(
            where: ${whereQuery},
            orderBy: [${orderBy}],
            take: $limit,
            ${cursorQuery}
          ) {
            characterId
            noteId
            createdAt
            metadata {
              uri
              content
            }
            ${
              input.useStat
                ? `
            stat {
              viewDetailCount
            }
            _count {
              fromNotes
              links
            }
            `
                : ""
            }
          }
        }
      `,
      {
        characterId: input.characterId,
        filter: pinnedNoteId || undefined,
        limit,
      },
    )
    .toPromise()
  if (pinnedNote) {
    data?.notes.unshift(pinnedNote)
  }
  if (pinnedNoteId) {
    data.noteCount += 1
  }
  const notes = {
    list: data?.notes || [],
    count: data?.noteCount || 0,
    cursor:
      data?.notes?.length < limit
        ? null
        : `${input.characterId}_${
            data?.notes?.[data?.notes?.length - 1]?.noteId
          }`,
  }

  const expandedNotes = {
    ...notes,
    pinnedNoteId: pinnedNote?.noteId,
    list: await Promise.all(
      notes.list.map(async (note: ExpandedNote) => {
        if (input.skipExpansion) {
          note.metadata.content.slug = getNoteSlug(note)
        } else {
          note = await expandCrossbellNote({
            note,
            useStat: input.useStat,
            useHTML: input.useHTML,
            useScore: false,
            useImageDimensions: input.useImageDimensions,
          })
        }

        if (!input.keepBody) {
          delete note.metadata?.content?.content
        }

        return note
      }),
    ),
  }

  const local = await getLocalPages({
    characterId: input.characterId,
    isPost: input.type[0] === "post", // In order to be compatible with old drafts
    type: input.type,
    handle: input.handle,
  })

  local.forEach((localPage) => {
    const index = expandedNotes.list.findIndex(
      (page) => localPage.draftKey === (page.noteId || page.draftKey) + "",
    )
    if (index !== -1) {
      if (
        new Date(localPage.updatedAt) >
        new Date(
          expandedNotes.list[index].updatedAt ||
            expandedNotes.list[index].createdAt,
        )
      ) {
        expandedNotes.list[index] = {
          ...expandedNotes.list[index],
          metadata: {
            content: localPage.metadata?.content,
          },
          local: true,
          draftKey: localPage.draftKey,
        }
      }
    } else {
      expandedNotes.list.push(localPage)
      expandedNotes.count++
    }
  })

  switch (visibility) {
    case PageVisibilityEnum.Published:
      expandedNotes.list = expandedNotes.list.filter(
        (page) =>
          (!page.metadata?.content?.date_published ||
            +new Date(page.metadata?.content?.date_published) <= +new Date()) &&
          page.noteId,
      )
      break
    case PageVisibilityEnum.Draft:
      expandedNotes.list = expandedNotes.list.filter((page) => !page.noteId)
      break
    case PageVisibilityEnum.Scheduled:
      expandedNotes.list = expandedNotes.list.filter(
        (page) =>
          page.metadata?.content?.date_published &&
          +new Date(page.metadata?.content?.date_published) > +new Date(),
      )
      break
  }

  return expandedNotes
}
type CalendarMap = {
  [key: string]: {
    day: dayjs.Dayjs
    count: number

    meta: {
      title: string
      slug?: string
    }[]
  }[]
}
export async function getCalendar(
  characterId?: number,
): Promise<{ calendar: CalendarMap[string][] }> {
  if (!characterId) {
    return {
      calendar: [],
    }
  }

  const format = (day: dayjs.Dayjs) => {
    const ww = day.format("ww")
    const mm = day.format("MM")
    if (ww === "01" && mm !== "01") {
      return `${day.year() + 1}-${ww}`
    } else {
      return `${day.year()}-${ww}`
    }
  }

  const calendarLength = 370
  const getCalendarTemp = () => {
    const calendar: CalendarMap = {}
    for (let i = calendarLength - 1; i >= 0; i--) {
      const day = dayjs().subtract(i, "day")
      let week = format(day)
      if (!calendar[week]) {
        calendar[week] = []
      }
      calendar[week].push({
        day: day,
        count: 0,

        meta: [],
      })
    }
    return calendar
  }

  const currentDate = new Date()
  currentDate.setUTCHours(0, 0, 0, 0)
  currentDate.setUTCDate(currentDate.getUTCDate() - 370)
  const utcString = currentDate.toISOString()

  const { data } = await client
    .query(
      gql`
        query getNotes($characterId: Int, $limit: Int, $utcString: DateTime) {
          notes(
            where: {
              characterId: { equals: $characterId }
              createdAt: { gte: $utcString }
              metadata: { content: { path: "sources", array_contains: "xlog" } }
            }
            take: $limit
          ) {
            createdAt
            metadata {
              content
            }
          }
        }
      `,
      {
        characterId,
        limit: 1000,
        utcString,
      },
    )
    .toPromise()

  let response = {
    calendar: getCalendarTemp(),
  }

  for (let i = 0; i < data.notes.length; i++) {
    const day = dayjs(data.notes[i].createdAt)
    let week = format(day)
    const today = response.calendar[week].find((item: any) =>
      item.day.isSame(day, "day"),
    )

    if (today) {
      today.count++

      today.meta.push({
        title: (
          data.notes[i].metadata.content.title ||
          data.notes[i].metadata.content.content
        ).slice(0, 20),
        slug: getNoteSlug(data.notes[i]),
      })
    } else {
      console.warn("not found", day)
    }
  }

  return {
    calendar: Object.keys(response.calendar)
      .sort()
      .map((key) =>
        response.calendar[key].map((item: any) => {
          item.day = item.day.valueOf()
          return item
        }),
      ),
  }
}

export async function getSearchPagesBySite(input: {
  characterId?: number
  keyword?: string
  cursor?: string
}) {
  const result = await indexer.search.notes(input.keyword || "", {
    cursor: input.cursor,
    characterId: input.characterId,
    tags: ["post"],
    sources: ["xlog"],
    orderBy: "publishedAt",
  })

  const list: ExpandedNote[] = await Promise.all(
    result.list.map(async (page: any) => {
      return await expandCrossbellNote({
        note: page,
        useStat: true,
        useScore: false,
        keyword: input.keyword,
      })
    }),
  )

  return {
    list,
    cursor: result.cursor,
    count: result.count,
  }
}

export async function getPage<TRender extends boolean = false>(input: {
  slug?: string
  characterId: number
  useStat?: boolean
  noteId?: number
  handle?: string // In order to be compatible with old drafts
  disableAutofill?: boolean
  translateTo?: Language
}) {
  const mustLocal = input.slug?.startsWith("!local-") && !input.noteId

  let page: NoteEntity | null = null

  if (!mustLocal) {
    if (!input.noteId) {
      const result = await client
        .query(
          gql`
            query getNotes($characterId: Int!, $slug: JSON!) {
              notes(
                where: {
                  characterId: {
                    equals: $characterId,
                  },
                  deleted: {
                    equals: false,
                  },
                  metadata: {
                    content: {
                      path: ["sources"],
                      array_contains: ["xlog"]
                    },
                    OR: [
                      {
                        content: {
                          path: ["attributes"],
                          array_contains: [{
                            trait_type: "xlog_slug",
                            value: $slug,
                          }]
                        }
                      },
                      {
                        content: {
                          path: ["title"],
                          equals: $slug
                        },
                      }
                    ]
                  },
                },
                orderBy: [{ createdAt: desc }],
                take: 1,
              ) {
                characterId
                noteId
                uri
                metadata {
                  uri
                  content
                }
                owner
                createdAt
                updatedAt
                publishedAt
                transactionHash
                blockNumber
                updatedTransactionHash
                updatedBlockNumber
                ${
                  input.useStat
                    ? `
                stat {
                  viewDetailCount
                }
                `
                    : ""
                }
              }
            }
          `,
          {
            characterId: input.characterId,
            slug: decodeURIComponent(input.slug!),
          },
        )
        .toPromise()
      page = result.data.notes[0]
    } else {
      const result = await client
        .query(
          gql`
            query getNote($characterId: Int!, $noteId: Int!) {
              note(
                where: {
                  note_characterId_noteId_unique: {
                    characterId: $characterId,
                    noteId: $noteId,
                  },
                },
              ) {
                characterId
                noteId
                uri
                metadata {
                  uri
                  content
                }
                owner
                createdAt
                updatedAt
                publishedAt
                transactionHash
                blockNumber
                updatedTransactionHash
                updatedBlockNumber
                ${
                  input.useStat
                    ? `
                stat {
                  viewDetailCount
                }
                `
                    : ""
                }
              }
            }
          `,
          {
            characterId: input.characterId,
            noteId: input.noteId,
          },
        )
        .toPromise()
      page = result.data.note
    }
  }

  // local page
  const local = await getLocalPages({
    characterId: input.characterId,
    handle: input.handle,
  })
  const localPages = local.filter(
    (page) =>
      page.draftKey === input.noteId + "" || page.draftKey === input.slug,
  )
  const localPage =
    localPages.length &&
    localPages.reduce((prev, current) => {
      return prev.updatedAt > current.updatedAt ? prev : current
    })

  let expandedNote: ExpandedNote | null = null
  if (page) {
    expandedNote = await expandCrossbellNote({
      note: page,
      useStat: input.useStat,
      disableAutofill: input.disableAutofill,
      translateTo: input.translateTo,
    })
  }

  if (localPage) {
    if (expandedNote) {
      if (new Date(localPage.updatedAt) > new Date(expandedNote.updatedAt)) {
        expandedNote = {
          ...expandedNote,
          metadata: {
            content: localPage.metadata?.content,
          },
          local: true,
        }
      }
    } else {
      expandedNote = localPage
    }
  }

  return expandedNote
}

export async function reportStats(input: {
  characterId: number
  noteId: number
}) {
  return await indexer.note.get(input.characterId, input.noteId)
}

export async function getLikes({
  characterId,
  noteId,
  cursor,
  includeCharacter,
}: {
  characterId: number
  noteId: number
  cursor?: string
  includeCharacter?: boolean
}) {
  const res = await indexer.link.getBacklinksByNote(characterId, noteId, {
    linkType: "like",
    cursor,
  })
  if (includeCharacter) {
    res.list?.forEach((item) => {
      ;(item as any).character = item.fromCharacter
    })
  }

  return res
}

export async function checkLike({
  account,
  characterId,
  noteId,
}: {
  account: GeneralAccount
  characterId: number
  noteId: number
}) {
  if (account.characterId) {
    return indexer.link.getMany(account.characterId, {
      linkType: "like",
      toCharacterId: characterId,
      toNoteId: noteId,
    })
  }
}

export async function mintPage(
  {
    address,
    characterId,
    noteId,
  }: {
    address: string
    characterId: number
    noteId: number
  },
  contract?: Contract,
) {
  return contract?.note.mint({
    characterId,
    noteId,
    toAddress: address as Address,
  })
}

export async function getMints({
  characterId,
  noteId,
  cursor,
  includeCharacter,
}: {
  characterId: number
  noteId: number
  cursor?: string
  includeCharacter?: boolean
}) {
  const data = await indexer.mintedNote.getManyOfNote(characterId, noteId, {
    cursor,
    limit: 5,
  })

  if (includeCharacter) {
    await Promise.all(
      data.list.map(async (item: any) => {
        if (!item.character) {
          item.character = await indexer.character.getPrimary(item.owner)
        }
      }),
    )
  }

  return data as ListResponse<
    MintedNoteEntity & {
      character: CharacterEntity
    }
  >
}

export async function checkMint({
  address,
  noteCharacterId,
  noteId,
}: {
  address: string
  noteCharacterId: number
  noteId: number
}) {
  return indexer.mintedNote.getManyOfAddress(address as Address, {
    noteCharacterId: noteCharacterId,
    noteId: noteId,
  })
}

export async function checkComment({
  characterId,
  noteCharacterId,
  noteId,
}: {
  characterId: number
  noteCharacterId: number
  noteId: number
}) {
  return indexer.note.getMany({
    characterId: characterId,
    toCharacterId: noteCharacterId,
    toNoteId: noteId,
    limit: 0,
  })
}

export async function getComments({
  characterId,
  noteId,
  cursor,
}: {
  characterId: number
  noteId: number
  cursor?: string
}) {
  const options = {
    toCharacterId: characterId,
    toNoteId: noteId,
    cursor,
    includeCharacter: true,
    includeNestedNotes: true,
    nestedNotesDepth: 3 as 3,
    nestedNotesLimit: 20,
    limit: 5,
  }

  const res = (await indexer.note.getMany(options)) || {
    total: 0,
    list: [],
  }

  res.list = res.list.filter(filterComment)

  return res
}

export async function anonymousComment(input: {
  targetCharacterId: number
  targetNoteId: number
  content: string
  name: string
  email: string
  url?: string
}) {
  return await fetch("/api/anonymous/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetCharacterId: input.targetCharacterId,
      targetNoteId: input.targetNoteId,
      content: input.content,
      name: input.name,
      email: input.email,
      url: input.url,
    }),
  })
}

export async function updateComment(
  {
    content,
    characterId,
    noteId,
  }: {
    content: string
    characterId: number
    noteId: number
  },
  contract: Contract,
) {
  return contract.note.setMetadata({
    characterId,
    noteId,
    metadata: {
      content,
      tags: ["comment"],
      sources: ["xlog"],
    },
  })
}

export async function checkMirror(characterId: number) {
  const notes = await indexer.note.getMany({
    characterId,
    sources: "xlog",
    tags: ["post", "Mirror.xyz"],
    limit: 0,
  })

  return notes.count === 0
}

export const getDistinctNoteTagsOfCharacter = async (characterId: number) => {
  const result = await indexer.note.getDistinctTagsOfCharacter(characterId, {
    sources: "xlog",
  })
  result.list = result.list.filter((tag) => !RESERVED_TAGS.includes(tag))

  return result
}

export async function getPinnedPageId({
  characterId,
}: {
  characterId?: number
}) {
  if (!characterId) return null

  const character = await indexer.character.get(characterId)
  const noteId = extractCharacterAttribute(character, PINNED_PAGE_KEY)?.value

  if (!character || !noteId || typeof noteId !== "number") return null

  return noteId
}

export async function getPinnedPage({ characterId }: { characterId?: number }) {
  const noteId = await getPinnedPageId({ characterId })

  if (noteId && characterId) {
    return indexer.note.get(characterId, noteId)
  } else {
    return null
  }
}
