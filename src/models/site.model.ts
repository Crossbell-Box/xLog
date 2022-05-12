import { prisma } from "~/lib/db.server"
import { isUUID } from "~/lib/uuid"
import { MembershipRole, PageType, Prisma, Site } from "@prisma/client"
import { Gate } from "~/lib/gate.server"
import dayjs from "dayjs"
import { sendLoginEmail } from "~/lib/mailgun.server"
import { SiteNavigationItem, SubscribeFormData } from "~/lib/types"
import { nanoid } from "nanoid"

export const checkSubdomain = async ({
  subdomain,
  updatingSiteId,
}: {
  subdomain: string
  updatingSiteId?: string
}) => {
  const existingSite = await prisma.site.findUnique({
    where: {
      subdomain,
    },
  })

  if (existingSite?.deletedAt) {
    // Actuall delete the site so that the subdomain can be used again
    await prisma.site.delete({
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

export async function getSitesForViewer(gate: Gate) {
  const user = gate.getUser(true)
  const sites = await getSitesByUser({ userId: user.id })
  return sites
}

export const getUserLastActiveSite = async (userId: string) => {
  const memberships = await prisma.membership.findMany({
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
    ? await prisma.site.findUnique({
        where: {
          id: input,
        },
      })
    : await prisma.site.findUnique({
        where: {
          subdomain: input,
        },
      })

  if (!site || site.deletedAt) {
    throw new Error(`Site not found`)
  }

  return site as Omit<Site, "navigation"> & {
    navigation: SiteNavigationItem[] | null
  }
}

export const getMembership = async (data: {
  siteId: string
  userId: string
  role: MembershipRole
}) => {
  const first = await prisma.membership.findFirst({
    where: {
      role: data.role,
      userId: data.userId,
      siteId: data.siteId,
    },
  })

  return first
}

export const getSitesByUser = async ({ userId }: { userId: string }) => {
  const memberships = await prisma.membership.findMany({
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

export const getSubscription = async (data: {
  userId: string
  siteId: string
}) => {
  const membership = await getMembership({
    ...data,
    role: MembershipRole.SUBSCRIBER,
  })
  if (!membership) return
  const config = membership.config as any
  return {
    ...membership,
    config: config && {
      telegram: config.telegram,
      email: config.email,
    },
  }
}

export async function updateSite(
  gate: Gate,
  payload: {
    site: string
    name?: string
    description?: string
    icon?: string | null
    subdomain?: string
    navigation?: SiteNavigationItem[]
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
      navigation: payload.navigation,
    },
  })

  return {
    site: updated,
    subdomainUpdated: updated.subdomain !== site.subdomain,
  }
}

export async function createSite(
  gate: Gate,
  payload: { name: string; subdomain: string }
) {
  const user = gate.getUser(true)
  await checkSubdomain({ subdomain: payload.subdomain })

  const navigation: SiteNavigationItem[] = [
    {
      id: nanoid(),
      label: "About",
      url: "/about",
    },
    {
      id: nanoid(),
      label: "Archives",
      url: "/archives",
    },
  ]
  const site = await prisma.site.create({
    data: {
      name: payload.name,
      subdomain: payload.subdomain,
      navigation,
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
}

export async function subscribeToSite(
  gate: Gate,
  input: {
    siteId: string
    email?: boolean
    telegram?: boolean
    newUser?: {
      email: string
      url: string
    }
  }
) {
  const { newUser } = input
  if (newUser) {
    // Create the login token instead
    const subscribeFormData: SubscribeFormData = {
      email: input.email,
      telegram: input.telegram,
      siteId: input.siteId,
    }
    const loginToken = await prisma.loginToken.create({
      data: {
        email: newUser.email,
        expiresAt: dayjs().add(10, "minutes").toDate(),
        subscribeForm: subscribeFormData,
      },
    })
    sendLoginEmail({
      token: loginToken.id,
      email: loginToken.email,
      url: newUser.url,
      subscribeForm: subscribeFormData,
    })
    return
  }

  const user = gate.getUser(true)

  const site = await getSite(input.siteId)
  const subscription = await getSubscription({
    userId: user.id,
    siteId: site.id,
  })
  if (!subscription) {
    await prisma.membership.create({
      data: {
        role: MembershipRole.SUBSCRIBER,
        user: {
          connect: {
            id: user.id,
          },
        },
        site: {
          connect: {
            id: site.id,
          },
        },
        config: {
          email: input.email,
          telegram: input.telegram,
        },
      },
    })
  } else {
    await prisma.membership.update({
      where: {
        id: subscription.id,
      },
      data: {
        config: {
          email: input.email,
          telegram: input.telegram,
        },
      },
    })
  }
}

export async function unsubscribeFromSite(
  gate: Gate,
  input: { siteId: string }
) {
  const user = gate.getUser(true)

  const subscription = await getSubscription({
    userId: user.id,
    siteId: input.siteId,
  })

  if (!subscription) {
    throw new Error(`Subscription not found`)
  }

  await prisma.membership.delete({
    where: {
      id: subscription.id,
    },
  })
}
