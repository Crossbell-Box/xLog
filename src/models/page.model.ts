import { notFound } from "~/lib/server-side-props"
import { PageVisibilityEnum, Notes, Note, ExpandedNote } from "~/lib/types"
import unidata from "~/queries/unidata.server"
import { indexer } from "@crossbell/indexer"
import { NoteMetadata } from "crossbell.js"
import { getStorage, getKeys } from "~/lib/storage"
import axios from "axios"
import type Unidata from "unidata.js"
import type { Contract } from "crossbell.js"
import { checkSlugReservedWords } from "~/lib/slug-reserved-words"
import { GeneralAccount } from "@crossbell/connect-kit"
import { expandUnidataNote, expandCrossbellNote } from "~/lib/expand-unit"

export async function checkPageSlug(
  input: {
    slug: string
    site: string
    pageId?: string
  },
  customUnidata?: Unidata,
) {
  const reserved = checkSlugReservedWords(input.slug)
  if (reserved) {
    return reserved
  } else {
    try {
      const page = await getPage(
        {
          page: input.slug,
          site: input.site,
        },
        customUnidata,
      )
      if (page && page.id !== input.pageId) {
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
      ...(input.publishedAt && {
        date_published: input.publishedAt,
      }),
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
    characterId: string
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

const getLocalPages = (input: { site: string; isPost?: boolean }) => {
  const pages: Note[] = []
  getKeys(`draft-${input.site}-`).forEach((key) => {
    const page = getStorage(key)
    if (input.isPost === undefined || page.isPost === input.isPost) {
      pages.push({
        id: key.replace(`draft-${input.site}-`, ""),
        title: page.values?.title,
        body: {
          content: page.values?.content,
          mime_type: "text/markdown",
        },
        date_updated: new Date(page.date).toISOString(),
        date_published: page.values?.publishedAt,
        summary: {
          content: page.values?.excerpt,
          mime_type: "text/markdown",
        },
        tags: [
          page.isPost ? "post" : "page",
          ...(page.values?.tags
            ?.split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag) || []),
        ],
        applications: ["xlog"],
        ...(page.values?.slug && {
          attributes: [
            {
              trait_type: "xlog_slug",
              value: page.values?.slug,
            },
          ],
        }),
        preview: true,
      })
    }
  })
  return pages
}

export async function getPagesBySite(
  input: {
    site?: string
    type: "post" | "page"
    visibility?: PageVisibilityEnum | null
    take?: number | null
    cursor?: string | null
    tags?: string[]
    useStat?: boolean
    keepBody?: boolean
  },
  customUnidata?: Unidata,
) {
  if (!input.site) {
    return {
      total: 0,
      list: [],
    }
  }

  const visibility = input.visibility || PageVisibilityEnum.All
  const crossbell = visibility === PageVisibilityEnum.Crossbell

  const options = {
    source: "Crossbell Note",
    identity: input.site,
    platform: "Crossbell",
    limit: input.take || 10,
    order_by: "date_published" as "date_published",
    filter: {
      tags: [...(input.tags || []), ...(crossbell ? [] : [input.type])],
      applications: [...(crossbell ? [] : ["xlog"])],
    },
    ...(input.cursor && { cursor: input.cursor }),
  }

  let pages: Notes = {
    total: 0,
    list: [],
  }

  pages = (await (customUnidata || unidata).notes.get(options)) || {
    total: 0,
    list: [],
  }

  if (!crossbell) {
    const local = getLocalPages({
      site: input.site,
      isPost: input.type === "post",
    })
    local.forEach((localPage) => {
      const index = pages.list.findIndex((page) => page.id === localPage.id)
      if (
        index >= 0 &&
        new Date(localPage.date_updated) >
          new Date(pages.list[index].date_updated)
      ) {
        localPage.metadata = pages.list[index].metadata
        pages.list[index] = localPage
      } else {
        pages.list.push(localPage)
        pages.total++
      }
    })
    pages.list = pages.list.sort(
      (a, b) => +new Date(b.date_published) - +new Date(a.date_published),
    )
  }

  if (pages?.list) {
    switch (visibility) {
      case PageVisibilityEnum.Published:
        pages.list = pages.list.filter(
          (page) =>
            +new Date(page.date_published) <= +new Date() && page.metadata,
        )
        break
      case PageVisibilityEnum.Draft:
        pages.list = pages.list.filter((page) => !page.metadata)
        break
      case PageVisibilityEnum.Scheduled:
        pages.list = pages.list.filter(
          (page) => +new Date(page.date_published) > +new Date(),
        )
        break
      case PageVisibilityEnum.Crossbell:
        pages.list = pages.list.filter(
          (page) => !page.applications?.includes("xlog"),
        )
        break
    }
    const allLength = pages.list.length
    pages.list = pages.list.filter(
      (page) => page.date_published !== new Date("9999-01-01").toISOString(),
    )
    pages.total = pages.total - (allLength - pages.list.length)

    await Promise.all(
      pages?.list.map(async (page) => {
        await expandUnidataNote(page, input.useStat)

        if (!input.keepBody) {
          delete page.body
        }

        return page
      }),
    )
  }

  return pages
}

export async function getSearchPagesBySite(input: {
  characterId?: string
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
      return await expandCrossbellNote(page, true, false, input.keyword)
    }),
  )

  return {
    list,
    cursor: result.cursor,
    count: result.count,
  }
}

export async function getPage<TRender extends boolean = false>(
  input: {
    /** page slug or id,  `site` is needed when `page` is a slug  */
    page?: string
    pageId?: string
    site?: string
    useStat?: boolean
  },
  customUnidata?: Unidata,
) {
  if (!input.site || !(input.page || input.pageId)) {
    return null
  }

  const mustLocal = input.pageId?.startsWith("local-")

  let page: Note | null = null

  if (!mustLocal) {
    // on-chain page
    if (!input.pageId) {
      const slug2Id = (
        await axios.get("/api/slug2id", {
          params: {
            handle: input.site,
            slug: input.page,
          },
        })
      ).data
      if (!slug2Id?.noteId) {
        return null
      }
      input.pageId = `${slug2Id.characterId}-${slug2Id.noteId}`
    }

    const pages = await (customUnidata || unidata).notes.get({
      source: "Crossbell Note",
      identity: input.site,
      platform: "Crossbell",
      filter: {
        id: input.pageId,
      },
    })
    page = pages?.list[0] || null
  }

  // local page
  const local = getLocalPages({
    site: input.site,
  })
  const localPage = local.find(
    (page) => page.id === input.page || page.id === input.pageId,
  )

  if (localPage) {
    if (page) {
      if (new Date(localPage.date_updated) > new Date(page.date_updated)) {
        localPage.metadata = page.metadata
        page = localPage
      }
    } else {
      page = localPage
    }
  }

  if (!page && !mustLocal) {
    throw notFound(`page ${input.page} not found`)
  }

  if (page) {
    await expandUnidataNote(page, input.useStat)
  }

  return page
}

export async function deletePage(
  { site, id }: { site: string; id: string },
  customUnidata?: Unidata,
  newbieToken?: string,
) {
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
  pageId,
  cursor,
  includeCharacter,
}: {
  pageId: string
  cursor?: string
  includeCharacter?: boolean
}) {
  const res = await indexer.getBacklinksOfNote(
    pageId.split("-")[0],
    pageId.split("-")[1],
    {
      linkType: "like",
      cursor,
    },
  )
  if (includeCharacter) {
    res.list?.forEach((item) => {
      ;(<any>item).character = item.fromCharacter
    })
  }

  return res
}

export async function checkLike({
  account,
  pageId,
}: {
  account: GeneralAccount
  pageId: string
}) {
  if (!account.characterId) {
    throw notFound(`character not found`)
  } else {
    return indexer.getLinks(account.characterId, {
      linkType: "like",
      toCharacterId: pageId.split("-")[0],
      toNoteId: pageId.split("-")[1],
    })
  }
}

export async function mintPage(
  {
    address,
    pageId,
  }: {
    address: string
    pageId: string
  },
  contract?: Contract,
) {
  return contract?.mintNote(pageId.split("-")[0], pageId.split("-")[1], address)
}

export async function getMints({
  pageId,
  cursor,
  includeCharacter,
}: {
  pageId: string
  cursor?: string
  includeCharacter?: boolean
}) {
  const data = await indexer.getMintedNotesOfNote(
    pageId.split("-")[0],
    pageId.split("-")[1],
    {
      cursor,
      limit: 5,
    },
  )

  if (includeCharacter) {
    await Promise.all(
      data.list.map(async (item: any) => {
        if (!item.character) {
          item.character = await indexer.getPrimaryCharacter(item.owner)
        }
      }),
    )
  }

  return data
}

export async function checkMint({
  address,
  pageId,
}: {
  address: string
  pageId: string
}) {
  return indexer.getMintedNotesOfAddress(address, {
    noteCharacterId: pageId.split("-")[0],
    noteId: pageId.split("-")[1],
  })
}

export async function getComments({
  pageId,
  cursor,
}: {
  pageId: string
  cursor?: string
}) {
  const options = {
    toCharacterId: pageId.split("-")[0],
    toNoteId: pageId.split("-")[1],
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
    pageId,
    content,
    externalUrl,
    originalId,
    characterId,
    noteId,
  }: {
    pageId: string
    content: string
    externalUrl: string
    originalId?: string
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

export function parsePageId(pageId: string) {
  const [characterId, noteId] = pageId.split("-").map(Number)

  return { characterId, noteId }
}

export function toPageId({
  characterId,
  noteId,
}: ReturnType<typeof parsePageId>) {
  return `${characterId}-${noteId}`
}

export async function getSummary({
  cid,
  lang,
}: {
  cid: string
  lang?: string
}) {
  return (
    await (await fetch(`/api/summary?cid=${cid}&lang=${lang || "en"}`)).json()
  ).data
}

export async function checkMirror(characterId: string) {
  const notes = await indexer.getNotes({
    characterId,
    sources: ["xlog"],
    tags: ["post", "Mirror.xyz"],
    limit: 0,
  })

  return notes.count === 0
}
