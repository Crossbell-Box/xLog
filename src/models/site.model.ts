import { SiteNavigationItem, Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import unidata from "~/queries/unidata.server"
import { toGateway } from "~/lib/ipfs-parser"
import type Unidata from "unidata.js"
import type { Profiles as UniProfiles } from "unidata.js"
import { createClient } from "@urql/core"
import axios from "axios"
import { Indexer } from "crossbell.js"
import { CharacterOperatorPermission } from "crossbell.js"
import type { useContract } from "@crossbell/contract"

type Contract = ReturnType<typeof useContract>

const indexer = new Indexer()

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
  site.description = site.bio

  if (site.avatars) {
    site.avatars = site.avatars.map((avatar) => toGateway(avatar))
  }
  if (site.banners) {
    site.banners.map((banner) => {
      banner.address = toGateway(banner.address)
      return banner
    })
  }
  delete site.metadata?.raw

  return site
}

export type GetUserSitesParams =
  | {
      address: string
      unidata?: Unidata
    }
  | {
      handle: string
      unidata?: Unidata
    }

export const getUserSites = async (params: GetUserSitesParams) => {
  let profiles: UniProfiles | null = null

  try {
    const source = "Crossbell Profile"
    const filter = { primary: true }

    if ("address" in params) {
      profiles = await (params.unidata || unidata).profiles.get({
        source,
        filter,
        identity: params.address,
        platform: "Ethereum",
      })
    }

    if ("handle" in params) {
      profiles = await (params.unidata || unidata).profiles.get({
        source,
        filter,
        identity: params.handle,
        platform: "Crossbell",
      })
    }
  } catch (error) {
    return null
  }

  const sites: Profile[] =
    profiles?.list?.map((profile) => {
      expandSite(profile)
      return profile
    }) ?? []

  return sites.length > 0 ? sites : null
}

export type GetAccountSitesParams = {
  handle: string
  unidata?: Unidata
}

export const getAccountSites = (
  params: GetAccountSitesParams,
): Promise<Profile[] | null> => {
  return getUserSites({
    handle: params.handle,
    unidata: params.unidata,
  })
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
            characterId
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
        try {
          site.metadata.content = (
            await axios.get(toGateway(site?.metadata?.uri), {
              ...(typeof window === "undefined" && {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
                },
              }),
            })
          ).data
        } catch (error) {
          console.warn(error)
        }
      }
      if (site.metadata.content) {
        site.metadata.content.name = site.metadata?.content?.name || site.handle
      } else {
        site.metadata.content = {
          name: site.handle,
        }
      }

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
  siteId: string,
  handle: string,
  customUnidata?: Unidata,
) => {
  const links = await (customUnidata || unidata).links.get({
    source: "Crossbell Link",
    identity: handle,
    platform: "Crossbell",
    filter: { to: siteId },
  })

  return !!links?.list?.length
}

export const getSiteSubscriptions = async (
  data: {
    siteId: string
    cursor?: string
    limit?: number
  },
  customUnidata?: Unidata,
) => {
  const links = await (customUnidata || unidata).links.get({
    source: "Crossbell Link",
    identity: data.siteId,
    platform: "Crossbell",
    reversed: true,
    cursor: data.cursor,
    limit: data.limit,
  })

  links?.list.map(async (item: any) => {
    item.character = item.metadata.from_raw
  }) || []

  return links
}

export const getSiteToSubscriptions = async (
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
    cursor: data.cursor,
  })

  links?.list.map(async (item: any) => {
    item.character = item.metadata.to_raw
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
    banner?: {
      address: string
      mime_type: string
    }
    connected_accounts?: Profile["connected_accounts"]
  },
  customUnidata?: Unidata,
  newbieToken?: string,
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
      ...(payload.banner && { banners: [payload.banner] }),
      ...(payload.subdomain && { username: payload.subdomain }),
      ...(payload.connected_accounts && {
        connected_accounts: payload.connected_accounts,
      }),
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
    {
      newbieToken,
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

export async function subscribeToSites(
  input: {
    user: Profile
    sites: {
      characterId: string
    }[]
  },
  contract?: Contract,
) {
  if (input.user.metadata?.proof) {
    return contract?.linkCharactersInBatch(
      input.user.metadata.proof,
      input.sites.map((s) => s.characterId).filter((c) => c) as any,
      [],
      "follow",
    )
  }
}

const xLogOperatorPermissions: CharacterOperatorPermission[] = [
  CharacterOperatorPermission.SET_NOTE_URI,
  CharacterOperatorPermission.DELETE_NOTE,
  CharacterOperatorPermission.POST_NOTE,
  CharacterOperatorPermission.SET_CHARACTER_URI,
]

export async function addOperator(
  input: {
    characterId: number
    operator: string
  },
  contract?: Contract,
) {
  if (input.operator && input.characterId) {
    return contract?.grantOperatorPermissionsForCharacter(
      input.characterId,
      input.operator,
      xLogOperatorPermissions,
    )
  }
}

export async function getOperators(input: { characterId?: number }) {
  if (input.characterId) {
    const result = await indexer?.getCharacterOperators(input.characterId, {
      limit: 100,
    })
    result.list = result.list
      .filter(
        (o) =>
          o.operator !== "0x0000000000000000000000000000000000000000" &&
          o.operator !== "0x0f588318a494e4508a121a32b6670b5494ca3357" &&
          o.operator !== "0xbbc2918c9003d264c25ecae45b44a846702c0e7c",
      ) // remove 0 and xSync
      .filter((o) => {
        for (const permission of xLogOperatorPermissions) {
          if (!o.permissions.includes(permission)) {
            return false
          }
        }
        return true
      })
    return result
  }
}

export async function isOperators(input: {
  characterId: number
  operator: string
}) {
  if (input.characterId) {
    const permissions =
      (await indexer?.getCharacterOperator(input.characterId, input.operator))
        ?.permissions || []
    for (const permission of xLogOperatorPermissions) {
      if (!permissions.includes(permission)) {
        return false
      }
    }
    return true
  }
  return false
}

export async function removeOperator(
  input: {
    characterId: number
    operator: string
  },
  contract?: Contract,
) {
  if (input.characterId) {
    return contract?.grantOperatorPermissionsForCharacter(
      input.characterId,
      input.operator,
      [],
    )
  }
}

export async function getNFTs(address: string, customUnidata?: Unidata) {
  const assets = await (customUnidata || unidata).assets.get({
    source: "Ethereum NFT",
    identity: address,
  })
  return assets
}

export async function getStat({ characterId }: { characterId: string }) {
  if (characterId) {
    const [stat, site, subscriptions, comments, notes] = await Promise.all([
      (
        await fetch(
          `https://indexer.crossbell.io/v1/stat/characters/${characterId}`,
        )
      ).json(),
      indexer.getCharacter(characterId),
      indexer.getBacklinksOfCharacter(characterId, {
        limit: 0,
      }),
      indexer.getNotes({
        limit: 0,
        toCharacterId: characterId,
      }),
      indexer.getNotes({
        characterId,
        sources: "xlog",
        tags: ["post"],
        limit: 0,
      }),
    ])
    return {
      viewsCount: stat.viewNoteCount,
      createdAt: site?.createdAt,
      subscriptionCount: subscriptions?.count,
      commentsCount: comments?.count,
      notesCount: notes?.count,
    }
  }
}

export async function tipCharacter(
  input: {
    fromCharacterId: string | number
    toCharacterId: string | number
    amount: number
  },
  contract: Contract,
) {
  const decimals = await contract.getMiraTokenDecimals()
  return await contract?.tipCharacter(
    input.fromCharacterId,
    input.toCharacterId,
    BigInt(input.amount) * BigInt(10) ** BigInt(decimals?.data || 18),
  )
}

export async function getTips(
  input: { toCharacterId: string | number },
  contract: Contract,
) {
  const address = await contract.getMiraTokenAddress()
  const tips = await indexer?.getTips({
    toCharacterId: input.toCharacterId,
    tokenAddress: address?.data || "0xAfB95CC0BD320648B3E8Df6223d9CDD05EbeDC64",
    includeMetadata: true,
    limit: 8,
  })

  if (tips?.list?.length) {
    const decimals = await contract.getMiraTokenDecimals()
    tips.list = tips.list.filter((t) => {
      return (
        BigInt(t.amount) >=
        BigInt(1) * BigInt(10) ** BigInt(decimals?.data || 18)
      )
    })
    tips.list = tips.list.map((t) => {
      return {
        ...t,
        amount: (
          BigInt(t.amount) /
          BigInt(10) ** BigInt(decimals?.data || 18)
        ).toString(),
      }
    })
  }

  return tips
}
