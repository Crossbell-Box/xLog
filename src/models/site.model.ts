import { SiteNavigationItem, Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import unidata from "~/queries/unidata.server"
import { renderPageContent } from "~/markdown"
import { toGateway } from "~/lib/ipfs-parser"
import type Unidata from "unidata.js"
import { createClient } from "@urql/core"
import axios from "axios"
import { indexer } from "~/queries/crossbell"
import type { LinkEntity, NoteEntity } from "crossbell.js"

export const checkSubdomain = async ({
  subdomain,
  updatingSiteId,
}: {
  subdomain: string
  updatingSiteId?: string
}) => {}

const expandSite = (site: Profile) => {
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
  site.description = renderPageContent(site.bio || "", true).contentHTML

  if (site.avatars) {
    site.avatars = site.avatars.map((avatar) => toGateway(avatar))
  }
  if (site.banners) {
    site.banners.map((banner) => {
      banner.address = toGateway(banner.address)
      return banner
    })
  }

  return site
}

export const getUserSites = async (
  address?: string,
  customUnidata?: Unidata,
) => {
  if (!address) {
    return null
  }
  const profiles = await (customUnidata || unidata).profiles.get({
    source: "Crossbell Profile",
    identity: address,
    platform: "Ethereum",
    filter: {
      primary: true,
    },
  })

  const sites: Profile[] = profiles.list?.map((profile) => {
    expandSite(profile)
    return profile
  })

  if (!sites || !sites.length) return null

  return sites
}

export const getSite = async (input: string, customUnidata?: Unidata) => {
  const profiles = await (customUnidata || unidata).profiles.get({
    source: "Crossbell Profile",
    identity: input,
    platform: "Crossbell",
  })

  const site: Profile = profiles.list[0]
  if (site) {
    expandSite(site)
  }

  return site
}

export const getSites = async (input: string[]) => {
  const client = createClient({
    url: "https://indexer.crossbell.io/v1/graphql",
  })
  const result = await client
    .query(
      `
        query getCharacters($identities: [String!], $limit: Int) {
          characters( where: { handle: { in: $identities } }, orderBy: [{ updatedAt: desc }], take: $limit ) {
            handle
            updatedAt
            notes {
              updatedAt
            }
            metadata {
              uri
              content
            }
          }
        }`,
      {
        identities: input,
      },
    )
    .toPromise()

  await Promise.all(
    result.data?.characters?.map(async (site: any) => {
      if (!site?.metadata?.content && site?.metadata?.uri) {
        site.metadata.content = (
          await axios.get(
            toGateway(site?.metadata?.uri, {
              needRequestAtServerSide: true,
            }),
            {
              ...(typeof window === "undefined" && {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
                },
              }),
            },
          )
        ).data
      }
      site.metadata.content.name = site.metadata.content.name || site.handle

      site.custom_domain =
        site.metadata?.content?.attributes?.find(
          (a: any) => a.trait_type === "xlog_custom_domain",
        )?.value || ""

      site.updatedAt = [...site.notes, site]
        .map((i) => i.updatedAt)
        .sort()
        .pop()
    }),
  )

  result.data?.characters?.sort((a: any, b: any) => {
    return b.updatedAt > a.updatedAt ? 1 : -1
  })

  return result.data?.characters
}

export const getSubscription = async (
  data: {
    userId: string
    siteId: string
  },
  customUnidata?: Unidata,
) => {
  const links = await (customUnidata || unidata).links.get({
    source: "Crossbell Link",
    identity: data.userId,
    platform: "Ethereum",
    filter: {
      to: data.siteId,
    },
  })
  return !!links?.list?.length
}

export const getSiteSubscriptions = async (
  data: {
    siteId: string
    cursor?: string
  },
  customUnidata?: Unidata,
) => {
  const links = await (customUnidata || unidata).links.get({
    source: "Crossbell Link",
    identity: data.siteId,
    platform: "Crossbell",
    reversed: true,
    cursor: data.cursor,
  })

  links?.list.map(async (item: any) => {
    item.character = item.metadata.from_raw
  }) || []

  return links
}

export async function updateSite(
  payload: {
    site: string
    name?: string
    description?: string
    icon?: string | null
    subdomain?: string
    navigation?: SiteNavigationItem[]
    css?: string
    ga?: string
    custom_domain?: string
  },
  customUnidata?: Unidata,
) {
  return await (customUnidata || unidata).profiles.set(
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
      ...((payload.navigation !== undefined ||
        payload.css !== undefined ||
        payload.ga !== undefined ||
        payload.custom_domain !== undefined) && {
        attributes: [
          ...(payload.navigation !== undefined
            ? [
                {
                  trait_type: "xlog_navigation",
                  value: JSON.stringify(payload.navigation),
                },
              ]
            : []),
          ...(payload.css !== undefined
            ? [
                {
                  trait_type: "xlog_css",
                  value: payload.css,
                },
              ]
            : []),
          ...(payload.ga !== undefined
            ? [
                {
                  trait_type: "xlog_ga",
                  value: payload.ga,
                },
              ]
            : []),
          ...(payload.custom_domain !== undefined
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
  customUnidata?: Unidata,
) {
  return await (customUnidata || unidata).profiles.set(
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

export async function subscribeToSite(
  input: {
    userId: string
    siteId: string
  },
  customUnidata?: Unidata,
) {
  return (customUnidata || unidata).links.set(
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

export async function unsubscribeFromSite(
  input: {
    userId: string
    siteId: string
  },
  customUnidata?: Unidata,
) {
  return (customUnidata || unidata).links.set(
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

export async function getNotifications(input: { siteCId: string }) {
  const [subscriptions, notes] = await Promise.all([
    indexer.getBacklinksOfCharacter(input.siteCId, {
      limit: 100,
    }),
    indexer.getNotes({
      toCharacterId: input.siteCId,
      limit: 100,
      includeCharacter: true,
    }),
  ])

  return [
    ...(subscriptions.list.map(
      (
        item: LinkEntity & {
          type?: "backlinks"
        },
      ) => {
        item.type = "backlinks"
        return item
      },
    ) as any),
  ]
    .concat(
      notes.list.map(
        (
          item: NoteEntity & {
            type?: "notes"
          },
        ) => {
          item.type = "notes"
          return item
        },
      ),
    )
    .sort((a, b) => {
      return b.createdAt > a.createdAt ? 1 : -1
    })
}
