import { SiteNavigationItem, Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import { checkReservedWords } from "~/lib/reserved-words"
import unidata from "~/lib/unidata"
import { indexer, getContract } from "~/lib/crossbell"

export const checkSubdomain = async ({
  subdomain,
  updatingSiteId,
}: {
  subdomain: string
  updatingSiteId?: string
}) => {
  // checkReservedWords(subdomain)
  // const existingSite = await prismaPrimary.site.findUnique({
  //   where: {
  //     subdomain,
  //   },
  // })
  // if (existingSite?.deletedAt) {
  //   // Actuall delete the site so that the subdomain can be used again
  //   await prismaPrimary.site.delete({
  //     where: {
  //       id: existingSite.id,
  //     },
  //   })
  //   return
  // }
  // if (existingSite && (!updatingSiteId || existingSite.id !== updatingSiteId)) {
  //   throw new Error(`Subdomain already taken`)
  // }
}

export const getUserSites = async (address?: string) => {
  if (!address) {
    return null
  }
  const profiles = await unidata.profiles.get({
    source: "Crossbell Profile",
    identity: address,
    platform: "Ethereum",
    filter: {
      primary: true,
    },
  })

  const sites = profiles.list
    ?.sort((a, b) => {
      if (a.metadata?.primary) {
        return -1
      } else if (b.metadata?.primary) {
        return 1
      } else {
        return +new Date(b.date_updated || 0) - +new Date(a.date_updated || 0)
      }
    })
    .map((profile) => {
      profile.name = profile.name || profile.username
      return profile
    })

  if (!sites || !sites.length) return null

  return sites
}

export const getSite = async (input: string) => {
  const profiles = await unidata.profiles.get({
    source: "Crossbell Profile",
    identity: input,
    platform: "Crossbell",
  })

  const site: Profile = profiles.list?.sort(
    (a, b) => +new Date(b.date_updated || 0) - +new Date(a.date_updated || 0),
  )?.[0]
  site.navigation = JSON.parse(
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_navigation",
    )?.value || "null",
  ) ||
    site.metadata?.raw?.["_xlog_navigation"] ||
    site.metadata?.raw?.["_crosslog_navigation"] || [
      { id: nanoid(), label: "Archives", url: "/archives" },
    ]
  site.css =
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_css",
    )?.value ||
    site.metadata?.raw?.["_xlog_css"] ||
    site.metadata?.raw?.["_crosslog_css"] ||
    ""
  site.ga =
    site.metadata?.raw?.attributes?.find((a: any) => a.trait_type === "xlog_ga")
      ?.value || ""
  site.custom_domain =
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_custom_domain",
    )?.value || ""
  site.name = site.name || site.username

  return site
}

export const getSubscription = async (data: {
  userId: string
  siteId: string
}) => {
  const links = await unidata.links.get({
    source: "Crossbell Link",
    identity: data.userId,
    platform: "Ethereum",
    filter: {
      to: data.siteId,
    },
  })
  return !!links?.list?.length
}

export const getSiteSubscriptions = async (data: { siteId: string }) => {
  const links = await unidata.links.get({
    source: "Crossbell Link",
    identity: data.siteId,
    platform: "Crossbell",
    reversed: true,
  })

  await Promise.all(
    links?.list.map(async (item: any) => {
      const owner = item.from
      item.character = await indexer.getCharacterByHandle(owner)
    }) || [],
  )
  return links
}

export async function updateSite(payload: {
  site: string
  name?: string
  description?: string
  icon?: string | null
  subdomain?: string
  navigation?: SiteNavigationItem[]
  css?: string
  ga?: string
  custom_domain?: string
}) {
  return await unidata.profiles.set(
    {
      source: "Crossbell Profile",
      identity: payload.site,
      platform: "Crossbell",
      action: "update",
    },
    {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { bio: payload.description }),
      ...(payload.icon && { avatars: [payload.icon] }),
      ...(payload.subdomain && { username: payload.subdomain }),
      ...((payload.navigation ||
        payload.css ||
        payload.ga ||
        payload.custom_domain) && {
        attributes: [
          ...(payload.navigation
            ? [
                {
                  trait_type: "xlog_navigation",
                  value: JSON.stringify(payload.navigation),
                },
              ]
            : []),
          ...(payload.css
            ? [
                {
                  trait_type: "xlog_css",
                  value: payload.css,
                },
              ]
            : []),
          ...(payload.ga
            ? [
                {
                  trait_type: "xlog_ga",
                  value: payload.ga,
                },
              ]
            : []),
          ...(payload.custom_domain
            ? [
                {
                  trait_type: "xlog_custom_domain",
                  value: payload.custom_domain,
                },
              ]
            : []),
        ],
      }),
    },
  )
}

export async function createSite(
  address: string,
  payload: { name: string; subdomain: string },
) {
  return await unidata.profiles.set(
    {
      source: "Crossbell Profile",
      identity: address,
      platform: "Ethereum",
      action: "add",
    },
    {
      username: payload.subdomain,
      name: payload.name,
      tags: [
        "navigation:" +
          JSON.stringify([
            {
              id: nanoid(),
              label: "Archives",
              url: "/archives",
            },
          ]),
      ],
    },
  )
}

export async function subscribeToSite(input: {
  userId: string
  siteId: string
}) {
  return unidata.links.set(
    {
      source: "Crossbell Link",
      identity: input.userId,
      platform: "Ethereum",
      action: "add",
    },
    {
      to: input.siteId,
      type: "follow",
    },
  )
}

export async function unsubscribeFromSite(input: {
  userId: string
  siteId: string
}) {
  return unidata.links.set(
    {
      source: "Crossbell Link",
      identity: input.userId,
      platform: "Ethereum",
      action: "remove",
    },
    {
      to: input.siteId,
      type: "follow",
    },
  )
}
