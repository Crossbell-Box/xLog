import { MembershipRole, PageType } from "@prisma/client"
import { nanoid } from "nanoid"
import { prisma, Prisma } from "~/lib/db.server"
import { type Gate } from "~/lib/gate.server"
import { sendEmailForNewPost } from "~/lib/mailgun.server"
import { renderPageContent } from "~/lib/markdown.server"
import { notFound } from "~/lib/server-side-props"
import { PageVisibilityEnum } from "~/lib/types"
import { isUUID } from "~/lib/uuid"
import { getSite } from "./site.model"

const checkPageSlug = async ({
  slug,
  excludePage,
  siteId,
}: {
  slug: string
  excludePage?: string
  siteId: string
}) => {
  if (!slug) {
    throw new Error("Missing page slug")
  }
  const page = await prisma.page.findFirst({
    where: {
      siteId,
      slug,
      id: excludePage && {
        not: excludePage,
      },
    },
  })
  if (!page) return

  if (page.deletedAt) {
    await prisma.page.delete({
      where: {
        id: page.id,
      },
    })
    return
  }

  throw new Error("Page slug already used")
}

export async function createOrUpdatePage(
  gate: Gate,
  input: {
    pageId?: string
    siteId: string
    slug?: string
    title?: string
    content?: string
    published?: boolean
    publishedAt?: string
    excerpt?: string
    isPost?: boolean
  }
) {
  const page = input.pageId
    ? await prisma.page.findUnique({
        where: {
          id: input.pageId,
        },
        include: {
          site: true,
        },
      })
    : await prisma.page.create({
        data: {
          title: "Untitled",
          slug: `untitled-${nanoid(4)}`,
          site: {
            connect: {
              id: input.siteId,
            },
          },
          content: "",
          excerpt: "",
        },
        include: {
          site: true,
        },
      })

  if (!page || page.deletedAt) {
    throw new Error(`Page not found`)
  }

  if (!gate.allows({ type: "can-create-page", siteId: page.siteId })) {
    throw gate.permissionError()
  }

  const slug = input.slug || page.slug
  await checkPageSlug({ slug, excludePage: page.id, siteId: page.siteId })

  const updated = await prisma.page.update({
    where: {
      id: page.id,
    },
    data: {
      title: input.title,
      content: input.content,
      published: input.published,
      publishedAt: input.publishedAt && new Date(input.publishedAt),
      excerpt: input.excerpt,
      slug,
      type: input.isPost ? "POST" : "PAGE",
    },
  })

  if (
    updated.type === PageType.POST &&
    !updated.subscribersNotifiedAt &&
    updated.published &&
    updated.publishedAt <= new Date()
  ) {
    await notifySubscribersForNewPost(gate, {
      pageId: updated.id,
    })
  }

  return { page: updated }
}

export async function getPagesBySite(
  gate: Gate,
  input: {
    site: string
    type: "post" | "page"
    visibility?: PageVisibilityEnum | null
    take?: number | null
    cursor?: string | null
  }
) {
  const site = await getSite(input.site)

  const visibility = input.visibility || PageVisibilityEnum.Published

  if (!gate.allows({ type: "can-list-page", visibility, siteId: site.id })) {
    throw gate.permissionError()
  }

  const now = new Date()

  const where: Prisma.PageWhereInput = {
    siteId: site.id,
    deletedAt: null,
    type: input.type === "post" ? "POST" : "PAGE",
  }
  if (input.visibility === PageVisibilityEnum.Published) {
    where.published = true
    where.publishedAt = {
      lte: now,
    }
  } else if (input.visibility === PageVisibilityEnum.Scheduled) {
    where.published = true
    where.publishedAt = {
      gt: now,
    }
  } else if (input.visibility === PageVisibilityEnum.Draft) {
    where.published = false
  }

  const take = input.take || 100
  const [nodes, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: take + 1,
      cursor: input.cursor
        ? {
            id: input.cursor,
          }
        : undefined,
    }),
    await prisma.page.count({
      where: {
        siteId: site.id,
      },
    }),
  ])

  const hasMore = nodes.length > take

  return {
    nodes,
    total,
    hasMore,
  }
}

export async function deletePage(gate: Gate, { id }: { id: string }) {
  const page = await prisma.page.findUnique({
    where: {
      id,
    },
  })

  if (!page) {
    throw notFound("page not found")
  }

  if (!gate.allows({ type: "can-delete-page", siteId: page.siteId })) {
    throw gate.permissionError()
  }

  await prisma.page.update({
    where: {
      id: page.id,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

export async function getPage(
  gate: Gate,
  input: {
    /** page slug or id,  `site` is needed when `page` is a slug  */
    page: string
    site?: string
    renderContent?: boolean
  }
) {
  const site = input.site ? await getSite(input.site) : null

  if (input.site && !site) {
    throw notFound(`site not found`)
  }

  const isPageUUID = isUUID(input.page)
  if (!isPageUUID && !input.site) {
    throw new Error("input.site is required because input.page is a slug")
  }

  const page = isPageUUID
    ? await prisma.page.findUnique({
        where: {
          id: input.page,
        },
      })
    : site
    ? await prisma.page.findFirst({
        where: { siteId: site.id, slug: input.page },
      })
    : null

  if (!page || page.deletedAt) {
    throw notFound(`page ${input.page} not found`)
  }

  if (!gate.allows({ type: "can-read-page", page })) {
    throw gate.permissionError()
  }

  if (input.renderContent) {
    const rendered = await renderPageContent(page.content)
    page.content = rendered.html
  }

  return page
}

export const notifySubscribersForNewPost = async (
  gate: Gate,
  input: {
    pageId: string
  }
) => {
  const page = await getPage(gate, { page: input.pageId, renderContent: true })
  const site = await getSite(page.siteId)

  if (!gate.allows({ type: "can-notify-site-subscribers", site })) {
    throw gate.permissionError()
  }

  if (page.subscribersNotifiedAt) {
    throw new Error("You have already notified subscribers for this post")
  }

  const memberships = await prisma.membership.findMany({
    where: {
      role: MembershipRole.SUBSCRIBER,
      siteId: site.id,
    },
    include: {
      user: true,
    },
  })

  if (memberships.length === 0) return

  await prisma.page.update({
    where: {
      id: page.id,
    },
    data: {
      subscribersNotifiedAt: new Date(),
    },
  })

  const emailSubscribers = memberships
    .filter((member) => (member.config as Prisma.JsonObject).email)
    .map((member) => member.user)

  sendEmailForNewPost({
    post: page,
    site,
    subscribers: emailSubscribers,
  })
}
