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
import { PageVisibilityEnum } from "~/lib/types"
import { isUUID } from "~/lib/uuid"
import { getSite } from "./site.model"
import { stripHTML } from "~/lib/utils"
import { sendEmailForNewPost } from "~/lib/mailgun.server"
import unidata from "~/lib/unidata"
import { Notes } from "unidata.js"

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

export async function createOrUpdatePage(
  input: {
    pageId?: string
    siteId: string
    title?: string
    content?: string
    published?: boolean
    publishedAt?: string
    excerpt?: string
    /** Only needed when creating page */
    isPost?: boolean
  },
) {
  return await unidata.notes.set({
    source: 'Crossbell Note',
    identity: input.siteId,
    platform: 'Crossbell',
    action: input.pageId ? 'update' : 'add',
  }, {
    ...(input.pageId && { id: input.pageId }),
    ...(input.title && { title: input.title }),
    ...(input.content && {
      body: {
        content: input.content,
        mime_type: 'text/markdown',
      }}),
    ...(input.publishedAt && { date_published: input.published ? input.publishedAt : new Date('9999-01-01').toISOString() }),
    ...(input.excerpt && {
      summary: {
        content: input.excerpt,
        mime_type: 'text/markdown',
      }
    }),
    tags: [input.isPost ? "post" : "page"],
  })
}

export async function scheduleEmailForPost(
  gate: Gate,
  input: { pageId: string; emailSubject?: string },
) {
  // const page = await getPage(gate, { page: input.pageId })

  // if (!gate.allows({ type: "can-update-page", siteId: page.siteId })) {
  //   throw gate.permissionError()
  // }

  // if (page.emailStatus) {
  //   throw new Error("Email already scheduled or sent")
  // }

  // await prismaPrimary.page.update({
  //   where: {
  //     id: page.id,
  //   },
  //   data: {
  //     emailStatus: "PENDING",
  //     emailSubject: input.emailSubject,
  //   },
  // })

  // await notifySubscribersForNewPost(gate, {
  //   pageId: page.id,
  // })
}

export async function getPagesBySite(
  input: {
    site: string
    type: "post" | "page"
    visibility?: PageVisibilityEnum | null
    take?: number | null
    cursor?: string | null
    includeContent?: boolean
    includeExcerpt?: boolean
    render?: boolean
  },
) {
  if (!input.site) {
    return {
      total: 0,
      list: [],
    }
  }

  const visibility = input.visibility || PageVisibilityEnum.All

  let pages = await unidata.notes.get({
    source: 'Crossbell Note',
    identity: input.site,
    platform: 'Crossbell',
    limit: input.take || 1000,
  });

  if (pages?.list) {
    switch (visibility) {
      case PageVisibilityEnum.Published:
        pages.list = pages.list.filter(page => +new Date(page.date_published) <= +new Date())
        break
      case PageVisibilityEnum.Draft:
        pages.list = pages.list.filter(page => page.date_published === new Date('9999-01-01').toISOString())
        break
      case PageVisibilityEnum.Scheduled:
        pages.list = pages.list.filter(page => +new Date(page.date_published) > +new Date() && page.date_published !== new Date('9999-01-01').toISOString())
        break
    }
    pages.list = pages.list.filter(page => page.tags?.includes(input.type))
    pages.total = pages.list.length

    pages.list = await Promise.all(pages?.list.map(async (page) => {
      if (page.body?.content && page.body?.mime_type === 'text/markdown' && input.render) {
        const rendered = await renderPageContent(page.body.content)
        page.body = {
          content: rendered.contentHTML,
          mime_type: 'text/html'
        }
        if (!page.summary) {
          page.summary = {
            content: rendered.excerpt,
            mime_type: 'text/html'
          }
        }
      }
      return page
    }))
  }

  return pages
}

export async function deletePage({ site, id }: { site: string, id: string }) {
  return await unidata.notes.set({
    source: 'Crossbell Note',
    identity: site,
    platform: 'Crossbell',
    action: 'remove',
  }, {
    id,
  })
}

export async function getPage<TRender extends boolean = false>(
  input: {
    /** page slug or id,  `site` is needed when `page` is a slug  */
    page: string
    site?: string
    render?: TRender
    includeAuthors?: boolean
  },
) {
  if (!input.site) {
    throw notFound(`site not found`)
  }

  const isPageUUID = isUUID(input.page)
  if (!isPageUUID && !input.site) {
    throw new Error("input.site is required because input.page is a slug")
  }

  const pages = await unidata.notes.get({
    source: 'Crossbell Note',
    identity: input.site,
    platform: 'Crossbell',
    filter: {
      id: input.page,
    }
  })

  const page = pages?.list[0]

  if (!page) {
    throw notFound(`page ${input.page} not found`)
  }

  if (new Date(page.date_published) > new Date()) {
    throw notFound()
  }

  if (pages?.list) {
    pages.list = await Promise.all(pages?.list.map(async (page) => {
      if (page.body?.content && page.body?.mime_type === 'text/markdown' && input.render) {
        const rendered = await renderPageContent(page.body.content)
        page.body = {
          content: rendered.contentHTML,
          mime_type: 'text/html'
        }
        if (!page.summary) {
          page.summary = {
            content: rendered.excerpt,
            mime_type: 'text/html'
          }
        }
      }
      return page
    }))
  }

  if (page.body?.content && page.body?.mime_type === 'text/markdown' && input.render) {
    const rendered = await renderPageContent(page.body.content)
    page.body = {
      content: rendered.contentHTML,
      mime_type: 'text/html'
    }
    if (!page.summary) {
      page.summary = {
        content: rendered.excerpt,
        mime_type: 'text/html'
      }
    }
  }

  return page
}

export const notifySubscribersForNewPost = async (
  gate: Gate,
  input: {
    pageId: string
  },
) => {
  // const page = await getPage(gate, { page: input.pageId, render: true })
  // const site = await getSite(page.siteId)

  // if (page.emailStatus !== PageEmailStatus.PENDING) {
  //   return
  // }

  // if (!page.published || page.publishedAt > new Date()) {
  //   return
  // }

  // if (page.type === "PAGE") {
  //   throw new Error("You can only notify subscribers for post updates")
  // }

  // if (!gate.allows({ type: "can-notify-site-subscribers", site })) {
  //   throw gate.permissionError()
  // }

  // await prismaPrimary.page.update({
  //   where: {
  //     id: page.id,
  //   },
  //   data: {
  //     emailStatus: PageEmailStatus.RUNNING,
  //   },
  // })

  // const memberships = await prismaPrimary.membership.findMany({
  //   where: {
  //     role: MembershipRole.SUBSCRIBER,
  //     siteId: site.id,
  //   },
  //   include: {
  //     user: true,
  //   },
  // })

  // const emailSubscribers = memberships
  //   .filter((member) => (member.config as any).email)
  //   .map((member) => member.user)

  // try {
  //   await sendEmailForNewPost({
  //     post: page,
  //     site,
  //     subscribers: emailSubscribers,
  //   })
  //   await prismaPrimary.page.update({
  //     where: {
  //       id: page.id,
  //     },
  //     data: {
  //       emailStatus: PageEmailStatus.SUCCESS,
  //     },
  //   })
  // } catch (error) {
  //   await prismaPrimary.page.update({
  //     where: {
  //       id: page.id,
  //     },
  //     data: {
  //       emailStatus: PageEmailStatus.FAILED,
  //     },
  //   })
  //   console.error("failed to send email", error)
  // }
}
