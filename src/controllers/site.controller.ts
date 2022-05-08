import { prisma } from "~/lib/db.server"
import {
  checkPageSlug,
  checkSubdomain,
  getSite,
  getSitesByUser,
} from "~/models/site.model"
import { PageVisibilityEnum } from "~/lib/types"
import { isUUID } from "~/lib/uuid"
import { MembershipRole, PageType, type Prisma } from "@prisma/client"
import { nanoid } from "nanoid"
import { Gate } from "~/lib/gate.server"
import { notFound } from "~/lib/server-side-props"
import { renderPageContent } from "~/lib/markdown.server"

export const siteController = {
  async getSites(gate: Gate) {
    const user = gate.getUser(true)
    const sites = await getSitesByUser({ userId: user.id })
    return sites
  },

  async getSite(siteIdOrSubdomainOrDomain: string) {
    const site = await getSite(siteIdOrSubdomainOrDomain)
    return { site }
  },

  async getPages(
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
  },

  async createOrUpdatePage(
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
    return { page: updated }
  },

  async deletePage(gate: Gate, { id }: { id: string }) {
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
  },

  async getPage(
    gate: Gate,
    input: {
      /** page slug or id,  `site` is needed when `page` is a slug  */
      page: string
      site: string
      renderContent?: boolean
    }
  ) {
    const site = input.site ? await getSite(input.site) : null

    if (input.site && !site) {
      throw notFound(`site not found`)
    }

    const isPageUUID = isUUID(input.page)
    if (!isPageUUID && !input.site) {
      throw new Error("missing input site")
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
  },

  async updateSite(
    gate: Gate,
    payload: {
      site: string
      name?: string
      description?: string
      icon?: string | null
      subdomain?: string
    }
  ) {
    const site = await getSite(payload.site)

    if (!gate.allows({ type: "can-update-site", site })) {
      throw gate.permissionError()
    }

    if (payload.subdomain) {
      await checkSubdomain({
        subdomain: payload.subdomain,
        updatingSiteId: site.id,
      })
    }

    const updated = await prisma.site.update({
      where: {
        id: site.id,
      },
      data: {
        name: payload.name,
        subdomain: payload.subdomain,
        description: payload.description,
        icon: payload.icon,
      },
    })

    return {
      site: updated,
      subdomainUpdated: updated.subdomain !== site.subdomain,
    }
  },

  async createSite(gate: Gate, payload: { name: string; subdomain: string }) {
    const user = gate.getUser(true)
    await checkSubdomain({ subdomain: payload.subdomain })

    const site = await prisma.site.create({
      data: {
        name: payload.name,
        subdomain: payload.subdomain,
        memberships: {
          create: {
            role: MembershipRole.OWNER,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
        pages: {
          create: {
            title: "About",
            slug: "about",
            excerpt: "",
            content: `My name is ${payload.name} and I'm a new site.`,
            published: true,
            publishedAt: new Date(),
            type: PageType.PAGE,
          },
        },
      },
    })

    return { site }
  },
}
