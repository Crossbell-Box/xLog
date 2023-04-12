import { SiteNavigationItem, Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import unidata from "~/queries/unidata.server"
import type Unidata from "unidata.js"
import type { Profiles as UniProfiles } from "unidata.js"
import { createClient, cacheExchange, fetchExchange } from "@urql/core"
import { Indexer } from "crossbell.js"
import { CharacterOperatorPermission } from "crossbell.js"
import type { useContract } from "@crossbell/contract"
import dayjs from "dayjs"
import { expandUnidataProfile } from "~/lib/expand-unit"

type Contract = ReturnType<typeof useContract>

const indexer = new Indexer()

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
      expandUnidataProfile(profile)
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
    expandUnidataProfile(site)
  }

  return site
}

export const getSites = async (input: number[]) => {
  const client = createClient({
    url: "https://indexer.crossbell.io/v1/graphql",
    exchanges: [cacheExchange, fetchExchange],
  })
  const oneMonthAgo = dayjs().subtract(15, "day").toISOString()
  const result = await client
    .query(
      `
        query getCharacters($identities: [Int!], $limit: Int) {
          characters( where: { characterId: { in: $identities } }, orderBy: [{ updatedAt: desc }], take: $limit ) {
            handle
            characterId
            metadata {
              uri
              content
            }
          }
          notes( where: { characterId: { in: $identities }, createdAt: { gt: "${oneMonthAgo}" }, metadata: { is: { content: { path: "sources", array_contains: "xlog" } } } }, orderBy: [{ updatedAt: desc }] ) {
            characterId
            createdAt
          }
        }`,
      {
        identities: input,
      },
    )
    .toPromise()

  result.data?.characters?.forEach((site: any) => {
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
  })

  const createdAts: {
    [key: string]: string
  } = {}
  result.data?.notes.forEach((note: any) => {
    if (!createdAts[note.characterId + ""]) {
      createdAts[note.characterId + ""] = note.createdAt
    }
  })
  const list = Object.keys(createdAts)
    .map((characterId: string) => {
      const character = result.data?.characters.find(
        (c: any) => c.characterId === characterId,
      )

      return {
        ...character,
        createdAt: createdAts[characterId],
      }
    })
    .sort((a: any, b: any) => {
      return b.createdAt > a.createdAt ? 1 : -1
    })

  return list
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

const getMiraTokenDecimals = async (contract: Contract) => {
  let decimals
  try {
    decimals = await contract.getMiraTokenDecimals()
  } catch (error) {
    decimals = {
      data: 18,
    }
  }
  return decimals
}

export async function tipCharacter(
  input: {
    fromCharacterId: string | number
    toCharacterId: string | number
    amount: number
    noteId?: string | number
  },
  contract: Contract,
) {
  const decimals = await getMiraTokenDecimals(contract)
  if (input.noteId) {
    return await contract?.tipCharacterForNote(
      input.fromCharacterId,
      input.toCharacterId,
      input.noteId,
      BigInt(input.amount) * BigInt(10) ** BigInt(decimals?.data || 18),
    )
  } else {
    return await contract?.tipCharacter(
      input.fromCharacterId,
      input.toCharacterId,
      BigInt(input.amount) * BigInt(10) ** BigInt(decimals?.data || 18),
    )
  }
}

export async function getTips(
  input: {
    toCharacterId: string | number
    characterId?: string | number
    toNoteId?: string | number
    cursor?: string
  },
  contract: Contract,
) {
  const address = await contract.getMiraTokenAddress()
  const tips = await indexer?.getTips({
    characterId: input.characterId,
    toNoteId: input.toNoteId,
    toCharacterId: input.toCharacterId,
    tokenAddress: address?.data || "0xAfB95CC0BD320648B3E8Df6223d9CDD05EbeDC64",
    includeMetadata: true,
    limit: 7,
    cursor: input.cursor,
  })

  if (tips?.list?.length) {
    const decimals = await getMiraTokenDecimals(contract)
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

export type AchievementSection = {
  info: {
    name: string
    title: string
  }
  groups: {
    info: {
      name: string
      title: string
    }
    items: {
      tokenId: number
      name: string
      status: "INACTIVE" | "MINTABLE" | "MINTED" | "COMMING"
      mintedAt: string | null
      transactionHash: string | null
      info: {
        tokenId: number
        name: string
        description: string
        media: string
        attributes: [
          {
            trait_type: string
            value: string
          },
        ]
      }
    }[]
  }[]
}

export async function getAchievements(characterId: string) {
  const crossbellAchievements = (await indexer.getAchievements(characterId))
    ?.list as AchievementSection[] | undefined
  const xLogAchievements: AchievementSection[] = [
    {
      info: {
        name: "xlog-journey",
        title: "xLog Journey",
      },
      groups: [
        {
          info: {
            name: "showcase-superstar",
            title: "Showcase Superstar",
          },
          items: [
            {
              info: {
                attributes: [
                  {
                    trait_type: "tier",
                    value: "base",
                  },
                ],
                description: "I am a superstar on xLog!",
                media:
                  "ipfs://QmVnTtYC4yQ7D1eGb3Ke9NVDadovSPZeg2q2cYA6j275Um/influencer/influencer:special.png",
                tokenId: 0,
                name: "Showcase Superstar",
              },
              tokenId: 0,
              name: "showcase-superstar",
              status: "COMMING",
              mintedAt: null,
              transactionHash: null,
            },
          ],
        },
        {
          info: {
            name: "mirror-xyz-migrator",
            title: "Mirror.xyz Migrator",
          },
          items: [
            {
              info: {
                attributes: [
                  {
                    trait_type: "tier",
                    value: "base",
                  },
                ],
                description: "I migrated from Mirror.xyz to xLog!",
                media:
                  "ipfs://bafybeicqfeaco6skylodk3cridjvntdxvbdaqhbtkky7exsxgdrzfp7gae",
                tokenId: 0,
                name: "Mirror.xyz Migrator",
              },
              tokenId: 0,
              name: "mirror-xyz-migrator",
              status: "COMMING",
              mintedAt: null,
              transactionHash: null,
            },
          ],
        },
      ],
    },
  ]

  return {
    list: [...xLogAchievements, ...(crossbellAchievements || [])],
  }
}

export async function mintAchievement(input: {
  characterId: string
  achievementId: number
}) {
  return indexer.mintAchievement(input.characterId, input.achievementId)
}

export async function getMiraBalance(characterId: string, contract: Contract) {
  const decimals = await getMiraTokenDecimals(contract)
  const result = await contract.getMiraBalanceOfCharacter(characterId)
  result.data = (
    BigInt(result.data) /
    BigInt(10) ** BigInt(decimals?.data || 18)
  ).toString()

  return result
}

export async function fetchTenant(
  host: string,
  retries: number,
): Promise<string> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=_xlog-challenge.${host}&type=TXT`,
    {
      headers: {
        accept: "application/dns-json",
      },
    },
  )
  const txt = await res.json()
  if (txt.Status === 5 && retries > 0) {
    console.log("retrying", host, retries - 1)
    return await fetchTenant(host, retries - 1)
  } else {
    return txt?.Answer?.[0]?.data.replace(/^"|"$/g, "")
  }
}

export async function checkDomainServer(domain: string, handle: string) {
  const tenant = await fetchTenant(domain, 5)

  if (!tenant || tenant !== handle) {
    return false
  } else {
    return true
  }
}

export async function checkDomain(domain: string, handle: string) {
  const check = await (
    await fetch(`/api/check-domain?domain=${domain}&handle=${handle}`)
  ).json()

  return check.data
}
