import { notFound } from "~/lib/server-side-props"
import { PageVisibilityEnum, Notes, Note } from "~/lib/types"
import unidata from "~/queries/unidata.server"
import { indexer } from "~/queries/crossbell"
import { NoteEntity, CharacterEntity, ListResponse } from "crossbell.js"
import { getStorage, getKeys } from "~/lib/storage"
import axios from "axios"
import { toGateway } from "~/lib/ipfs-parser"
import type Unidata from "unidata.js"
import type { Contract } from "crossbell.js"
import { checkSlugReservedWords } from "~/lib/slug-reserved-words"

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
  )
}

const expandPage = async (page: Note, useStat?: boolean) => {
  if (page.body?.content && page.body?.mime_type === "text/markdown") {
    const { renderPageContent } = await import("~/markdown")
    const rendered = renderPageContent(page.body.content, true)
    page.body = {
      content: page.body.content,
      mime_type: "text/markdown",
    }
    if (!page.summary) {
      page.summary = {
        content: rendered.excerpt,
        mime_type: "text/html",
      }
    }
    page.cover = rendered.cover
  }
  page.slug = encodeURIComponent(
    page.attributes?.find((a) => a.trait_type === "xlog_slug")?.value ||
      page.metadata?.raw?._xlog_slug ||
      page.metadata?.raw?._crosslog_slug ||
      "",
  )
  delete page.metadata?.raw

  if (useStat) {
    const stat = await (
      await fetch(
        `https://indexer.crossbell.io/v1/stat/notes/${page.id.replace(
          "-",
          "/",
        )}`,
      )
    ).json()
    page.views = stat.viewDetailCount
  }

  return page
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
    cursor: input.cursor,
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
        await expandPage(page, input.useStat)

        if (!input.keepBody) {
          delete page.body
        }

        return page
      }),
    )
  }

  return pages
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
    await expandPage(page, input.useStat)
  }

  return page
}

async function getPrimaryCharacter(address: string) {
  const character = await indexer.getPrimaryCharacter(address)
  return character?.characterId
}

export async function deletePage(
  { site, id }: { site: string; id: string },
  customUnidata?: Unidata,
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
  )
}

export async function likePage(
  {
    address,
    pageId,
  }: {
    address: string
    pageId: string
  },
  contract?: Contract,
) {
  const characterId = await getPrimaryCharacter(address)
  if (!characterId) {
    throw notFound(`character not found`)
  } else {
    return contract?.linkNote(
      characterId,
      pageId.split("-")[0],
      pageId.split("-")[1],
      "like",
    )
  }
}

export async function unlikePage(
  {
    address,
    pageId,
  }: {
    address: string
    pageId: string
  },
  contract?: Contract,
) {
  const characterId = await getPrimaryCharacter(address)
  if (!characterId) {
    throw notFound(`character not found`)
  } else {
    return contract?.unlinkNote(
      characterId,
      pageId.split("-")[0],
      pageId.split("-")[1],
      "like",
    )
  }
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
    await Promise.all(
      res.list?.map(async (item) => {
        if (
          !item.fromCharacter?.metadata?.content &&
          item.fromCharacter?.metadata?.uri
        ) {
          try {
            item.fromCharacter.metadata.content = (
              await axios.get(toGateway(item.fromCharacter?.metadata?.uri), {
                ...(typeof window === "undefined" && {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
                  },
                }),
              })
            ).data
          } catch (error) {
            console.warn(error)
          }
        }
        ;(<any>item).character = item.fromCharacter
      }),
    )
  }

  return res
}

export async function checkLike({
  address,
  pageId,
}: {
  address: string
  pageId: string
}) {
  const characterId = await getPrimaryCharacter(address)
  if (!characterId) {
    throw notFound(`character not found`)
  } else {
    return indexer.getLinks(characterId, {
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
    },
  )

  if (includeCharacter) {
    await Promise.all(
      data.list.map(async (item: any) => {
        const owner = item.owner
        item.character = await indexer.getPrimaryCharacter(owner)
        if (
          !item.character?.metadata?.content &&
          item.character?.metadata?.uri
        ) {
          try {
            item.character.metadata.content = (
              await axios.get(toGateway(item.character?.metadata?.uri), {
                ...(typeof window === "undefined" && {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
                  },
                }),
              })
            ).data
          } catch (error) {
            console.warn(error)
          }
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

export async function commentPage(
  {
    address,
    pageId,
    content,
    externalUrl,
  }: {
    address: string
    pageId: string
    content: string
    externalUrl: string
  },
  contract?: Contract,
) {
  const characterId = await getPrimaryCharacter(address)
  if (!characterId) {
    throw notFound(`character not found`)
  } else {
    return contract?.postNoteForNote(
      characterId,
      {
        content,
        external_urls: [externalUrl],
        tags: ["comment"],
        sources: ["xlog"],
      },
      pageId.split("-")[0],
      pageId.split("-")[1],
    )
  }
}

export async function getComments({ pageId }: { pageId: string }) {
  const options = {
    toCharacterId: pageId.split("-")[0],
    toNoteId: pageId.split("-")[1],
    cursor: "",
    includeCharacter: true,
    includeNestedNotes: true,
    nestedNotesDepth: 3 as 3,
    nestedNotesLimit: 20,
  }

  let pages: ListResponse<
    NoteEntity & {
      character?: CharacterEntity | null
    }
  > = {
    count: 0,
    list: [],
    cursor: "",
  }

  let cursor = ""
  do {
    options.cursor = cursor
    const res = (await indexer.getNotes(options)) || {
      total: 0,
      list: [],
    }
    pages.count = res.count
    pages.list = pages.list.concat(res.list)
    cursor = res.cursor || ""
  } while (cursor)

  return pages
}
