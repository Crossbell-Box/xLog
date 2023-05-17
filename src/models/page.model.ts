import { NoteMetadata } from "crossbell.js"
import type {
  CharacterEntity,
  Contract,
  ListResponse,
  MintedNoteEntity,
  NoteEntity,
} from "crossbell.js"
import type Unidata from "unidata.js"

import { GeneralAccount } from "@crossbell/connect-kit"
import { indexer } from "@crossbell/indexer"

import { expandCrossbellNote } from "~/lib/expand-unit"
import { notFound } from "~/lib/server-side-props"
import { checkSlugReservedWords } from "~/lib/slug-reserved-words"
import { getKeys, getStorage } from "~/lib/storage"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"

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

export async function createOrUpdatePage(
  input: {
    pageId?: string
    siteId: string
    slug?: string
    tags?: string
    title?: string
    content?: string
    published?: boolean
    publishedAt?: string
    excerpt?: string
    /** Only needed when creating page */
    isPost?: boolean
    externalUrl?: string
    applications?: string[]
  },
  customUnidata?: Unidata,
  newbieToken?: string,
) {
  const { default: unidata } = await import("~/queries/unidata.server")

  if (!input.published) {
    return await (customUnidata || unidata).notes.set(
      {
        source: "Crossbell Note",
        identity: input.siteId,
        platform: "Crossbell",
        action: "remove",
      },
      {
        id: input.pageId,
      },
      {
        newbieToken,
      },
    )
  }
  return await (customUnidata || unidata).notes.set(
    {
      source: "Crossbell Note",
      identity: input.siteId,
      platform: "Crossbell",
      action: input.pageId ? "update" : "add",
    },
    {
      ...(input.externalUrl && { related_urls: [input.externalUrl] }),
      ...(input.pageId && { id: input.pageId }),
      ...(input.title && { title: input.title }),
      ...(input.content && {
        body: {
          content: input.content,
          mime_type: "text/markdown",
        },
      }),
      date_published: input.publishedAt || new Date().toISOString(),
      ...(input.excerpt && {
        summary: {
          content: input.excerpt,
          mime_type: "text/markdown",
        },
      }),
      tags: [
        input.isPost ? "post" : "page",
        ...(input.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag) || []),
      ],
      applications: [
        "xlog",
        ...(input.applications?.filter((app) => app !== "xlog") || []),
      ],
      ...(input.slug && {
        attributes: [
          {
            trait_type: "xlog_slug",
            value: input.slug,
          },
        ],
      }),
    },
    {
      newbieToken,
    },
  )
}

export async function postNotes(
  input: {
    siteId: string
    characterId: number
    notes: NoteMetadata[]
  },
  contract?: Contract,
) {
  return contract?.postNotes(
    input.notes.map((note) => ({
      characterId: input.characterId,
      metadataOrUri: note,
    })),
  )
}

const getLocalPages = (input: {
  characterId: number
  isPost?: boolean
  handle?: string
}) => {
  const pages: ExpandedNote[] = []
  getKeys([`draft-${input.characterId}-`, `draft-${input.handle}-`]).forEach(
    (key) => {
      const page = getStorage(key)
      if (input.isPost === undefined || page.isPost === input.isPost) {
        const note: ExpandedNote = {
          characterId: input.characterId,
          noteId: 0,
          draftKey: key
            .replace(`draft-${input.characterId}-`, "")
            .replace(`draft-${input.handle}-${input.characterId}-`, ""), // In order to be compatible with old drafts
          linkItemType: null,
          linkKey: "",
          toCharacterId: null,
          toAddress: null,
          toNoteId: null,
          toHeadCharacterId: null,
          toHeadNoteId: null,
          toContractAddress: null,
          toTokenId: null,
          toLinklistId: null,
          toUri: null,
          deleted: false,
          locked: false,
          contractAddress: null,
          uri: null,
          operator: "",
          owner: "",
          createdAt: new Date(page.date).toISOString(),
          updatedAt: new Date(page.date).toISOString(),
          deletedAt: null,
          transactionHash: "",
          blockNumber: 0,
          logIndex: 0,
          updatedTransactionHash: "",
          updatedBlockNumber: 0,
          updatedLogIndex: 0,
          metadata: {
            content: {
              title: page.values?.title,
              content: page.values?.content,
              date_published: page.values?.publishedAt,
              summary: page.values?.excerpt,
              tags: [
                page.isPost ? "post" : "page",
                ...(page.values?.tags
                  ?.split(",")
                  .map((tag: string) => tag.trim())
                  .filter((tag: string) => tag) || []),
              ],
              slug: page.values?.slug,
              sources: ["xlog"],
            },
          },
          local: true,
        }
        pages.push(note)
      }
    },
  )
  return pages
}

export async function getPagesBySite(input: {
  characterId?: number
  type: "post" | "page"
  visibility?: PageVisibilityEnum
  limit?: number
  cursor?: string
  tags?: string[]
  useStat?: boolean
  useHTML?: boolean
  keepBody?: boolean
  handle?: string // In order to be compatible with old drafts
}) {
  if (!input.characterId) {
    return {
      count: 0,
      list: [],
      cursor: null,
    }
  }

  const visibility = input.visibility || PageVisibilityEnum.All

  const notes = await indexer.getNotes({
    characterId: input.characterId,
    limit: input.limit || 10,
    cursor: input.cursor,
    orderBy: "publishedAt",
    tags: [...(input.tags || []), input.type],
    sources: "xlog",
  })

  const list = await Promise.all(
    notes?.list.map(async (note) => {
      const expanded = await expandCrossbellNote({
        note,
        useStat: input.useStat,
        useHTML: input.useHTML,
        useScore: false,
      })
      if (!input.keepBody) {
        delete expanded.metadata?.content?.content
      }
      return expanded
    }),
  )

  const expandedNotes: {
    list: ExpandedNote[]
    count: number
    cursor: string | null
  } = Object.assign(notes, {
    list,
  })

  const local = getLocalPages({
    characterId: input.characterId,
    isPost: input.type === "post",
    handle: input.handle,
  })

  local.forEach((localPage) => {
    const index = expandedNotes.list.findIndex(
      (page) => localPage.draftKey === (page.noteId || page.draftKey) + "",
    )
    if (index !== -1) {
      if (
        new Date(localPage.updatedAt) >
        new Date(expandedNotes.list[index].updatedAt)
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

  expandedNotes.list = expandedNotes.list.sort((a, b) => {
    if (!a.metadata?.content?.date_published) {
      return -1
    } else if (!b.metadata?.content?.date_published) {
      return 1
    } else {
      return (
        +new Date(b.metadata?.content?.date_published) -
        +new Date(a.metadata?.content?.date_published)
      )
    }
  })

  return expandedNotes
}

export async function getSearchPagesBySite(input: {
  characterId?: number
  keyword?: string
  cursor?: string
}) {
  const result = await indexer.searchNotes(input.keyword || "", {
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
}) {
  const mustLocal = input.slug?.startsWith("local-")

  let page: NoteEntity | null = null

  if (!mustLocal) {
    if (!input.noteId) {
      const response = await fetch(
        `/api/slug2id?${new URLSearchParams({
          characterId: input.characterId + "",
          slug: input.slug!,
        }).toString()}`,
      )
      input.noteId = (await response.json())?.noteId
    }
    if (input.noteId) {
      page = await indexer.getNote(input.characterId, input.noteId)
    }
  }

  // local page
  const local = getLocalPages({
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

  let expandedNote: ExpandedNote | undefined
  if (page) {
    expandedNote = await expandCrossbellNote({
      note: page,
      useStat: input.useStat,
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

  if (!expandedNote && !mustLocal) {
    throw notFound(`page ${input.slug} not found`)
  }

  return expandedNote
}

export async function deletePage(
  { site, id }: { site: string; id: string },
  customUnidata?: Unidata,
  newbieToken?: string,
) {
  const { default: unidata } = await import("~/queries/unidata.server")

  return await (customUnidata || unidata).notes.set(
    {
      source: "Crossbell Note",
      identity: site,
      platform: "Crossbell",
      action: "remove",
    },
    {
      id,
    },
    {
      newbieToken,
    },
  )
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
  const res = await indexer.getBacklinksOfNote(characterId, noteId, {
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
  if (!account.characterId) {
    throw notFound(`character not found`)
  } else {
    return indexer.getLinks(account.characterId, {
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
  return contract?.mintNote(characterId, noteId, address)
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
  const data = await indexer.getMintedNotesOfNote(characterId, noteId, {
    cursor,
    limit: 5,
  })

  if (includeCharacter) {
    await Promise.all(
      data.list.map(async (item: any) => {
        if (!item.character) {
          item.character = await indexer.getPrimaryCharacter(item.owner)
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
  return indexer.getMintedNotesOfAddress(address, {
    noteCharacterId: noteCharacterId,
    noteId: noteId,
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

  const res = (await indexer.getNotes(options)) || {
    total: 0,
    list: [],
  }

  return res
}

export async function updateComment(
  {
    content,
    externalUrl,
    characterId,
    noteId,
  }: {
    content: string
    externalUrl: string
    characterId: number
    noteId: number
  },
  contract: Contract,
) {
  return contract.setNoteMetadata(characterId, noteId, {
    content,
    external_urls: [externalUrl],
    tags: ["comment"],
    sources: ["xlog"],
  })
}

export async function checkMirror(characterId: number) {
  const notes = await indexer.getNotes({
    characterId,
    sources: "xlog",
    tags: ["post", "Mirror.xyz"],
    limit: 0,
  })

  return notes.count === 0
}
