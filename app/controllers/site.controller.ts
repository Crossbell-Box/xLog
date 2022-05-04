import { prisma } from "~/lib/db.server"
import {
  checkPageSlug,
  checkSubdomain,
  getSite,
  getSitesByUser,
} from "~/models/site.model"
import { PageVisibilityEnum } from "~/lib/types"
import { isUUID } from "~/lib/uuid"
import { MembershipRole, PageType, Prisma } from "@prisma/client"
import { nanoid } from "nanoid"
import { z } from "zod"
import { type AuthUser } from "~/lib/auth.server"
import { createGate } from "~/lib/gate.server"

export const siteController = {
  async getSites(user: AuthUser | undefined | null) {
    const gate = createGate({ user, requireAuth: true })
    const sites = await getSitesByUser({ userId: gate.user.id })
    return sites
  },

  async getSite(siteIdOrSubdomainOrDomain: string) {
    const site = await getSite(siteIdOrSubdomainOrDomain)
    return { site }
  },

  async getPages(
    user: AuthUser | undefined | null,
    input: {
      site: string
      type: "post" | "page"
      visibility?: PageVisibilityEnum | null
      take?: number | null
      cursor?: string | null
    }
  ) {
    const gate = createGate({ user })

    const validated = z
      .object({
        site: z.string(),
        type: z.enum(["post", "page"]).default("post"),
        visibility: z
          .enum([
            PageVisibilityEnum.All,
            PageVisibilityEnum.Published,
            PageVisibilityEnum.Draft,
            PageVisibilityEnum.Scheduled,
          ])
          .nullish(),
        take: z.number().default(30),
        cursor: z.string().nullish(),
      })
      .parse(input)

    const site = await getSite(validated.site)

    const visibility = validated.visibility || PageVisibilityEnum.Published

    if (!gate.allows({ type: "can-list-page", visibility, siteId: site.id })) {
      throw gate.permissionError()
    }

    const now = new Date()

    const where: Prisma.PageWhereInput = {
      siteId: site.id,
      deletedAt: null,
      type: validated.type === "post" ? "POST" : "PAGE",
    }
    if (validated.visibility === PageVisibilityEnum.Published) {
      where.published = true
      where.publishedAt = {
        lte: now,
      }
    } else if (validated.visibility === PageVisibilityEnum.Scheduled) {
      where.published = true
      where.publishedAt = {
        gt: now,
      }
    } else if (validated.visibility === PageVisibilityEnum.Draft) {
      where.published = false
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: validated.take + 1,
        cursor: validated.cursor
          ? {
              id: validated.cursor,
            }
          : undefined,
      }),
      await prisma.page.count({
        where: {
          siteId: site.id,
        },
      }),
    ])

    const hasMore = pages.length > validated.take

    return {
      pages,
      total,
      hasMore,
    }
  },

  async createOrUpdatePage(
    user: AuthUser | null | undefined,
    input: {
      pageId?: string
      siteId: string
      slug?: string
      title?: string
      content?: string
      published?: boolean
      publishedAt?: Date
      excerpt?: string
      isPost?: boolean
    }
  ) {
    const gate = createGate({ user })

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
        publishedAt: input.publishedAt,
        excerpt: input.excerpt,
        slug,
        type: input.isPost ? "POST" : "PAGE",
      },
    })
    return { page: updated }
  },

  async getPage(
    user: AuthUser | null | undefined,
    input: {
      /** page slug or id,  `site` is needed when `page` is a slug  */
      page: string
      site: string
    }
  ) {
    const gate = createGate({ user })

    const site = input.site ? await getSite(input.site) : null

    if (input.site && !site) {
      throw new Error(`site not found`)
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
      throw new Response(`page ${input.page} not found`, {
        status: 404,
      })
    }

    if (!gate.allows({ type: "can-read-page", page })) {
      throw gate.permissionError()
    }

    return page
  },

  async updateSite(
    user: AuthUser | undefined | null,
    payload: {
      site: string
      name?: string
      description?: string
      icon?: string | null
      subdomain?: string
    }
  ) {
    const gate = createGate({ user, requireAuth: true })
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

  async createSite(
    user: AuthUser | null | undefined,
    payload: { name: string; subdomain: string }
  ) {
    const gate = createGate({ user, requireAuth: true })

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
                id: gate.user.id,
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
