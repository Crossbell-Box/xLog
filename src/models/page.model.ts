import { nanoid } from "nanoid"
import {
  prismaPrimary,
  Prisma,
  prismaRead,
  PageType,
  MembershipRole,
} from "~/lib/db.server"
import { type Gate } from "~/lib/gate.server"
import { sendEmailForNewPost } from "~/lib/mailgun.server"
import { Rendered, renderPageContent } from "~/markdown"
import { notFound } from "~/lib/server-side-props"
import { PageVisibilityEnum } from "~/lib/types"
import { isUUID } from "~/lib/uuid"
import { getSite } from "./site.model"
import { stripHTML } from "~/lib/utils"
import { getSiteLink } from "~/lib/helpers"
import juice from "juice"
import { checkEmailTemplateSegment } from "~/lib/reserved-words"

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

  checkEmailTemplateSegment(slug)

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
    isPost?: boolean
  }
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

  if (!gate.allows({ type: "can-create-page", siteId: page.siteId })) {
    throw gate.permissionError()
  }

  const slug = input.slug || page.slug
  await checkPageSlug({ slug, excludePage: page.id, siteId: page.siteId })

  // Just checking if the page content can be rendered
  await renderPageContent(page.content)

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
      const rendered = await renderPageContent(node.content)
      return {
        ...node,
        autoExcerpt: rendered.excerpt,
      }
    })
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
    input.render ? await renderPageContent(page.content) : null
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
  }
) => {
  const page = await getPage(gate, { page: input.pageId, render: true })
  const site = await getSite(page.siteId)

  if (!gate.allows({ type: "can-notify-site-subscribers", site })) {
    throw gate.permissionError()
  }

  if (page.subscribersNotifiedAt) {
    throw new Error("You have already notified subscribers for this post")
  }

  const memberships = await prismaPrimary.membership.findMany({
    where: {
      role: MembershipRole.SUBSCRIBER,
      siteId: site.id,
    },
    include: {
      user: true,
    },
  })

  if (memberships.length === 0) return

  await prismaPrimary.page.update({
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

  // TODO: maybe run this in a job queue
  // We will need to use BullMQ to send email for scheduled posts anyway
  sendEmailForNewPost({
    post: page,
    site,
    subscribers: emailSubscribers,
  }).catch((error) => {
    console.error("failed to send email", error)
  })
}

export const renderPageForEmail = async (input: {
  pageSlug: string
  subdomain: string
}) => {
  const siteLink = getSiteLink({
    subdomain: input.subdomain,
  })
  const url = `${siteLink}/__email_templates__/${input.pageSlug}`
  const html = await fetch(url)
    .then((res) => res.text())
    .then((html) => html.replace(/<script[^\>]*><\/script>/g, ""))

  const resultHTML = await new Promise<string>((resolve, reject) => {
    juice.juiceResources(
      html,
      {
        webResources: {
          scripts: false,
          images: false,
          svgs: false,
          relativeTo: siteLink,
        },
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })

  return resultHTML
}
