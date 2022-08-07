import { nanoid } from "nanoid"
import {
  prismaPrimary,
  Prisma,
  prismaRead,
  MembershipRole,
  PageEmailStatus,
} from "~/lib/db.server"
import { type Gate } from "~/lib/gate.server"
import { Rendered, renderPageContent } from "~/markdown"
import { notFound } from "~/lib/server-side-props"
import { PageVisibilityEnum, Notes } from "~/lib/types"
import { isUUID } from "~/lib/uuid"
import { stripHTML } from "~/lib/utils"
import unidata from "~/lib/unidata"
import { indexer, getContract } from "~/lib/crossbell"

const checkPageSlug = async ({
  slug,
  excludePage,
  siteId,
}: {
  slug: string
  excludePage?: string
  siteId: string
}) => {
  // if (!slug) {
  //   throw new Error("Missing page slug")
  // }
  // const page = await prismaPrimary.page.findFirst({
  //   where: {
  //     siteId,
  //     slug,
  //     id: excludePage && {
  //       not: excludePage,
  //     },
  //   },
  // })
  // if (!page) return
  // if (page.deletedAt) {
  //   await prismaPrimary.page.delete({
  //     where: {
  //       id: page.id,
  //     },
  //   })
  //   return
  // }
  // throw new Error("Page slug already used")
}

export async function createOrUpdatePage(input: {
  pageId?: string
  siteId: string
  slug?: string
  title?: string
  content?: string
  published?: boolean
  publishedAt?: string
  excerpt?: string
  /** Only needed when creating page */
  isPost?: boolean
}) {
  return await unidata.notes.set(
    {
      source: "Crossbell Note",
      identity: input.siteId,
      platform: "Crossbell",
      action: input.pageId ? "update" : "add",
    },
    {
      ...(input.pageId && { id: input.pageId }),
      ...(input.title && { title: input.title }),
      ...(input.content && {
        body: {
          content: input.content,
          mime_type: "text/markdown",
        },
      }),
      ...(input.publishedAt && {
        date_published: input.published
          ? input.publishedAt
          : new Date("9999-01-01").toISOString(),
      }),
      ...(input.excerpt && {
        summary: {
          content: input.excerpt,
          mime_type: "text/markdown",
        },
      }),
      tags: [input.isPost ? "post" : "page"],
      applications: ["xlog"],
      ...(input.slug && { _xlog_slug: input.slug }),
    },
  )
}

export async function getPagesBySite(input: {
  site?: string
  type: "post" | "page"
  visibility?: PageVisibilityEnum | null
  take?: number | null
  cursor?: string | null
  includeContent?: boolean
  includeExcerpt?: boolean
  render?: boolean
}) {
  if (!input.site) {
    return {
      total: 0,
      list: [],
    }
  }

  const visibility = input.visibility || PageVisibilityEnum.All

  let pages: Notes = (await unidata.notes.get({
    source: "Crossbell Note",
    identity: input.site,
    platform: "Crossbell",
    limit: input.take || 1000,
  })) || {
    total: 0,
    list: [],
  }

  if (pages?.list) {
    switch (visibility) {
      case PageVisibilityEnum.Published:
        pages.list = pages.list.filter(
          (page) => +new Date(page.date_published) <= +new Date(),
        )
        break
      case PageVisibilityEnum.Draft:
        pages.list = pages.list.filter(
          (page) =>
            page.date_published === new Date("9999-01-01").toISOString(),
        )
        break
      case PageVisibilityEnum.Scheduled:
        pages.list = pages.list.filter(
          (page) =>
            +new Date(page.date_published) > +new Date() &&
            page.date_published !== new Date("9999-01-01").toISOString(),
        )
        break
    }
    pages.list = pages.list
      .filter(
        (page) =>
          page.applications?.includes("Crosslog") ||
          page.applications?.includes("xlog"),
      )
      .filter((page) => page.tags?.includes(input.type))
      .sort((a, b) => +new Date(b.date_published) - +new Date(a.date_published))
    pages.total = pages.list.length

    pages.list = await Promise.all(
      pages?.list.map(async (page) => {
        if (
          page.body?.content &&
          page.body?.mime_type === "text/markdown" &&
          input.render
        ) {
          const rendered = await renderPageContent(page.body.content)
          page.body = {
            content: rendered.contentHTML,
            mime_type: "text/html",
          }
          if (!page.summary) {
            page.summary = {
              content: rendered.excerpt,
              mime_type: "text/html",
            }
          }
        }
        page.slug =
          page.metadata?.raw?._xlog_slug ||
          page.metadata?.raw?._crosslog_slug ||
          page.id
        return page
      }),
    )
  }

  return pages
}

export async function deletePage({ site, id }: { site: string; id: string }) {
  return await unidata.notes.set(
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

export async function getPage<TRender extends boolean = false>(input: {
  /** page slug or id,  `site` is needed when `page` is a slug  */
  page?: string
  pageId?: string
  site?: string
  render?: TRender
  includeAuthors?: boolean
}) {
  if (!input.site || !(input.page || input.pageId)) {
    return undefined
  }

  const pages: Notes | null = await unidata.notes.get({
    source: "Crossbell Note",
    identity: input.site,
    platform: "Crossbell",
    limit: 1000,
    ...(input.pageId && {
      filter: {
        id: input.pageId,
      },
    }),
  })

  let page
  if (input.page) {
    page = pages?.list.find((item) => {
      item.slug =
        item.metadata?.raw?._xlog_slug ||
        item.metadata?.raw?._crosslog_slug ||
        item.id
      return item.slug === input.page
    })
  } else {
    page = pages?.list[0]
  }

  if (!page) {
    throw notFound(`page ${input.page} not found`)
  }

  if (pages?.list) {
    pages.list = await Promise.all(
      pages?.list.map(async (page) => {
        if (
          page.body?.content &&
          page.body?.mime_type === "text/markdown" &&
          input.render
        ) {
          const rendered = await renderPageContent(page.body.content)
          page.body = {
            content: rendered.contentHTML,
            mime_type: "text/html",
          }
          if (!page.summary) {
            page.summary = {
              content: rendered.excerpt,
              mime_type: "text/html",
            }
          }
        }
        page.slug =
          page.metadata?.raw?._xlog_slug ||
          page.metadata?.raw?._crosslog_slug ||
          page.id
        return page
      }),
    )
  }

  if (
    page.body?.content &&
    page.body?.mime_type === "text/markdown" &&
    input.render
  ) {
    const rendered = await renderPageContent(page.body.content)
    page.body = {
      content: rendered.contentHTML,
      mime_type: "text/html",
    }
    if (!page.summary) {
      page.summary = {
        content: rendered.excerpt,
        mime_type: "text/html",
      }
    }
  }

  return page
}

async function getPrimaryCharacter(address: string) {
  const character = await indexer.getPrimaryCharacter(address)
  return character?.characterId
}

export async function likePage({
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
    return getContract()?.linkNote(
      characterId,
      pageId.split("-")[0],
      pageId.split("-")[1],
      "like",
    )
  }
}

export async function unlikePage({
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
    return getContract()?.unlinkNote(
      characterId,
      pageId.split("-")[0],
      pageId.split("-")[1],
      "like",
    )
  }
}

export async function getLikes({ pageId }: { pageId: string }) {
  return indexer.getBacklinksOfNote(
    pageId.split("-")[0],
    pageId.split("-")[1],
    {
      linkType: "like",
      limit: 0,
    },
  )
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

export async function mintPage({
  address,
  pageId,
}: {
  address: string
  pageId: string
}) {
  return getContract()?.mintNote(
    pageId.split("-")[0],
    pageId.split("-")[1],
    address,
  )
}

export async function getMints({ pageId }: { pageId: string }) {
  return indexer.getMintedNotesOfNote(
    pageId.split("-")[0],
    pageId.split("-")[1],
    {
      limit: 0,
    },
  )
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
