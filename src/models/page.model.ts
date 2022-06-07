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

  const page = await prismaPrimary.page.findFirst({
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
    await prismaPrimary.page.delete({
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
    /** Only needed when creating page */
    isPost?: boolean
  },
) {
  const user = gate.getUser(true)
  const page = input.pageId
    ? await prismaPrimary.page.findUnique({
        where: {
          id: input.pageId,
        },
        include: {
          site: true,
        },
      })
    : await prismaPrimary.page.create({
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
          authors: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          site: true,
        },
      })

  if (!page || page.deletedAt) {
    throw new Error(`Page not found`)
  }

  if (input.pageId) {
    if (!gate.allows({ type: "can-update-page", siteId: page.siteId })) {
      throw gate.permissionError()
    }
  } else {
    if (!gate.allows({ type: "can-create-page", siteId: page.siteId })) {
      throw gate.permissionError()
    }
  }

  const slug = input.slug || page.slug
  await checkPageSlug({ slug, excludePage: page.id, siteId: page.siteId })

  // Just checking if the page content can be rendered
  const rendered = input.content
    ? await renderPageContent(input.content)
    : undefined

  const updated = await prismaPrimary.page.update({
    where: {
      id: page.id,
    },
    data: {
      title: input.title || "Untitled",
      content: input.content,
      published: input.published,
      publishedAt: input.publishedAt && new Date(input.publishedAt),
      excerpt: input.excerpt && stripHTML(input.excerpt),
      slug,
      type: input.isPost ? "POST" : "PAGE",
      rendered,
    },
  })

  return { page: updated }
}

export async function scheduleEmailForPost(
  gate: Gate,
  input: { pageId: string; emailSubject?: string },
) {
  const page = await getPage(gate, { page: input.pageId })

  if (!gate.allows({ type: "can-update-page", siteId: page.siteId })) {
    throw gate.permissionError()
  }

  if (page.emailStatus) {
    throw new Error("Email already scheduled or sent")
  }

  await prismaPrimary.page.update({
    where: {
      id: page.id,
    },
    data: {
      emailStatus: "PENDING",
      emailSubject: input.emailSubject,
    },
  })

  await notifySubscribersForNewPost(gate, {
    pageId: page.id,
  })
}

export async function getPagesBySite(
  gate: Gate,
  input: {
    site: string
    type: "post" | "page"
    visibility?: PageVisibilityEnum | null
    take?: number | null
    cursor?: string | null
    includeContent?: boolean
    includeExcerpt?: boolean
  },
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
  if (visibility === PageVisibilityEnum.Published) {
    where.published = true
    where.publishedAt = {
      lte: now,
    }
  } else if (visibility === PageVisibilityEnum.Scheduled) {
    where.published = true
    where.publishedAt = {
      gt: now,
    }
  } else if (visibility === PageVisibilityEnum.Draft) {
    where.published = false
  }

  const take = input.take || 100
  const [nodes, total] = await Promise.all([
    prismaRead.page.findMany({
      where,
      orderBy: {
        publishedAt: "desc",
      },
      take: take + 1,
      cursor: input.cursor
        ? {
            id: input.cursor,
          }
        : undefined,
    }),
    await prismaRead.page.count({
      where,
    }),
  ])

  const hasMore = nodes.length > take

  const nodesRendered = await Promise.all(
    nodes.slice(0, take).map(async (node) => {
      if (!input.includeContent && !input.includeExcerpt) {
        return node
      }
      const rendered = node.rendered
        ? (node.rendered as Rendered)
        : await renderPageContent(node.content)
      if (!input.includeContent) {
        rendered.contentHTML = ""
      }
      if (!input.includeExcerpt) {
        rendered.excerpt = ""
        node.excerpt = ""
      }
      return {
        ...node,
        contentHTML: rendered.contentHTML,
        autoExcerpt: rendered.excerpt,
      }
    }),
  )

  return {
    nodes: nodesRendered,
    total,
    hasMore,
  }
}

export async function deletePage(gate: Gate, { id }: { id: string }) {
  const page = await prismaPrimary.page.findUnique({
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

  await prismaPrimary.page.update({
    where: {
      id: page.id,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

export async function getPage<TRender extends boolean = false>(
  gate: Gate,
  input: {
    /** page slug or id,  `site` is needed when `page` is a slug  */
    page: string
    site?: string
    render?: TRender
    includeAuthors?: boolean
  },
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
    ? await prismaRead.page.findUnique({
        where: {
          id: input.page,
        },
        include: {
          authors: input.includeAuthors,
        },
      })
    : site
    ? await prismaRead.page.findFirst({
        where: { siteId: site.id, slug: input.page },
        include: {
          authors: input.includeAuthors,
        },
      })
    : null

  if (!page || page.deletedAt) {
    throw notFound(`page ${input.page} not found`)
  }

  if (!gate.allows({ type: "can-read-page", page })) {
    if (!page.published || page.publishedAt > new Date()) {
      throw notFound()
    } else {
      throw gate.permissionError()
    }
  }

  const rendered = (
    input.render
      ? page.rendered || (await renderPageContent(page.content))
      : null
  ) as TRender extends true ? Rendered : null

  return {
    ...page,
    rendered,
  }
}

export const notifySubscribersForNewPost = async (
  gate: Gate,
  input: {
    pageId: string
  },
) => {
  const page = await getPage(gate, { page: input.pageId, render: true })
  const site = await getSite(page.siteId)

  if (page.emailStatus !== PageEmailStatus.PENDING) {
    return
  }

  if (!page.published || page.publishedAt > new Date()) {
    return
  }

  if (page.type === "PAGE") {
    throw new Error("You can only notify subscribers for post updates")
  }

  if (!gate.allows({ type: "can-notify-site-subscribers", site })) {
    throw gate.permissionError()
  }

  await prismaPrimary.page.update({
    where: {
      id: page.id,
    },
    data: {
      emailStatus: PageEmailStatus.RUNNING,
    },
  })

  const memberships = await prismaPrimary.membership.findMany({
    where: {
      role: MembershipRole.SUBSCRIBER,
      siteId: site.id,
    },
    include: {
      user: true,
    },
  })

  const emailSubscribers = memberships
    .filter((member) => (member.config as any).email)
    .map((member) => member.user)

  try {
    await sendEmailForNewPost({
      post: page,
      site,
      subscribers: emailSubscribers,
    })
    await prismaPrimary.page.update({
      where: {
        id: page.id,
      },
      data: {
        emailStatus: PageEmailStatus.SUCCESS,
      },
    })
  } catch (error) {
    await prismaPrimary.page.update({
      where: {
        id: page.id,
      },
      data: {
        emailStatus: PageEmailStatus.FAILED,
      },
    })
    console.error("failed to send email", error)
  }
}
