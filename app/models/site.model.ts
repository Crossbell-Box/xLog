import { prismaRead, prismaWrite } from "~/lib/db.server"
import { isUUID } from "~/lib/uuid"
import { MembershipRole } from "@prisma/client"

export const checkSubdomain = async ({
  subdomain,
  updatingSiteId,
}: {
  subdomain: string
  updatingSiteId?: string
}) => {
  const existingSite = await prismaRead.site.findUnique({
    where: {
      subdomain,
    },
  })

  if (existingSite?.deletedAt) {
    // Actuall delete the site so that the subdomain can be used again
    await prismaWrite.site.delete({
      where: {
        id: existingSite.id,
      },
    })
    return
  }

  if (existingSite && (!updatingSiteId || existingSite.id !== updatingSiteId)) {
    throw new Error(`Subdomain already taken`)
  }
}

export const getUserLastActiveSite = async (userId: string) => {
  const memberships = await prismaRead.membership.findMany({
    where: {
      userId,
      role: {
        in: [MembershipRole.OWNER, MembershipRole.ADMIN],
      },
    },
    include: {
      site: true,
    },
    orderBy: {
      lastSwitchedTo: "desc",
    },
  })

  const site = memberships[0]?.site

  if (!site || site.deletedAt) return null

  return site
}

export const getSite = async (input: string) => {
  const site = isUUID(input)
    ? await prismaRead.site.findUnique({
        where: {
          id: input,
        },
      })
    : await prismaRead.site.findUnique({
        where: {
          subdomain: input,
        },
      })

  if (!site || site.deletedAt) {
    throw new Error(`Site not found`)
  }

  return site
}

export const getMembership = async (data: {
  siteId: string
  userId: string
  role: MembershipRole
}) => {
  const first = await prismaRead.membership.findFirst({
    where: {
      role: data.role,
      userId: data.userId,
      siteId: data.siteId,
    },
  })

  return first
}

export const getSitesByUser = async ({ userId }: { userId: string }) => {
  const memberships = await prismaRead.membership.findMany({
    where: {
      userId,
      role: {
        in: [MembershipRole.ADMIN, MembershipRole.OWNER],
      },
    },
    include: {
      site: true,
    },
  })
  return memberships.map((m) => m.site)
}

export const checkPageSlug = async ({
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
  const page = await prismaRead.page.findFirst({
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
    await prismaWrite.page.delete({
      where: {
        id: page.id,
      },
    })
    return
  }

  throw new Error("Page slug already used")
}

export const getSubscription = async (data: {
  userId: string
  siteId: string
}) => {
  const membership = await getMembership({
    ...data,
    role: MembershipRole.SUBSCRIBER,
  })
  const config = membership?.config as any
  return {
    config: config && {
      telegram: config.telegram,
      email: config.email,
    },
  }
}
