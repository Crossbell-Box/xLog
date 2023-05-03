import { CharacterOperatorPermission, Indexer } from "crossbell.js"
import type Unidata from "unidata.js"

import type { useContract } from "@crossbell/contract"
import { cacheExchange, createClient, fetchExchange } from "@urql/core"

import { expandCrossbellCharacter } from "~/lib/expand-unit"
import { SiteNavigationItem } from "~/lib/types"

type Contract = ReturnType<typeof useContract>

const indexer = new Indexer()

export const getSite = async (input: string) => {
  const result = await indexer.getCharacterByHandle(input)
  if (result) {
    return expandCrossbellCharacter(result)
  }
}

export const getSiteByAddress = async (input: string) => {
  const result = await indexer.getCharacters(input, {
    primary: true,
  })

  if (result?.list?.[0]) {
    return expandCrossbellCharacter(result.list[0])
  }
}

export const getSubscriptionsFromList = async (
  list: number[],
  fromCharacterId: number,
) => {
  const client = createClient({
    url: "https://indexer.crossbell.io/v1/graphql",
    exchanges: [cacheExchange, fetchExchange],
  })

  const response = await client
    .query(
      `
    query getFollows($list: [Int!], $fromCharacterId: Int!) {
      links(
        where: {
          linkType: { equals: "follow" },
          fromCharacterId: { equals: $fromCharacterId },
          toCharacterId: { in: $list }
        },
      ) {
        toCharacterId
      }
    }
  `,
      {
        list,
        fromCharacterId,
      },
    )
    .toPromise()

  return response.data?.links.map((link: any) => link.toCharacterId)
}

export const getSubscription = async (input: {
  toCharacterId: number
  characterId: number
}) => {
  const result = await indexer.getLinks(input.characterId, {
    linkType: "follow",
    toCharacterId: input.toCharacterId,
  })

  return !!result?.list?.length
}

export const getSiteSubscriptions = async (data: {
  characterId: number
  cursor?: string
  limit?: number
}) => {
  return indexer.getBacklinksOfCharacter(data.characterId, {
    linkType: "follow",
    cursor: data.cursor,
    limit: data.limit,
  })
}

export const getSiteToSubscriptions = async (data: {
  characterId: number
  cursor?: string
}) => {
  return indexer.getLinks(data.characterId, {
    linkType: "follow",
    cursor: data.cursor,
  })
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
    ua?: string
    custom_domain?: string
    banner?: {
      address: string
      mime_type: string
    }
    connected_accounts?: {
      identity: string
      platform: string
      url?: string | undefined
    }[]
  },
  customUnidata?: Unidata,
  newbieToken?: string,
) {
  const { default: unidata } = await import("~/queries/unidata.server")

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
        payload.ua !== undefined ||
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
          ...(payload.ua !== undefined
            ? [
                {
                  trait_type: "xlog_ua",
                  value: payload.ua,
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

export async function getCommentsBySite(input: {
  characterId?: number
  cursor?: string
}) {
  const notes = await indexer.getNotes({
    toCharacterId: input.characterId,
    limit: 7,
    includeCharacter: true,
    cursor: input.cursor,
    includeNestedNotes: true,
    nestedNotesDepth: 3 as 3,
    nestedNotesLimit: 20,
  })

  notes.list = notes.list.filter((item) =>
    item.toNote?.metadata?.content?.sources?.includes("xlog"),
  )

  return notes
}

const xLogOperatorPermissions: CharacterOperatorPermission[] = [
  CharacterOperatorPermission.SET_NOTE_URI,
  CharacterOperatorPermission.DELETE_NOTE,
  CharacterOperatorPermission.POST_NOTE,
  CharacterOperatorPermission.SET_CHARACTER_URI,
]

export async function addOperator(
  input: {
    characterId?: number
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

export async function getNFTs(address: string) {
  const { default: unidata } = await import("~/queries/unidata.server")

  const assets = await unidata.assets.get({
    source: "Ethereum NFT",
    identity: address,
  })
  return assets
}

export async function getStat({ characterId }: { characterId: number }) {
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
      createTx: site?.transactionHash,
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
    limit?: number
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
    limit: input.limit || 7,
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
      status: "INACTIVE" | "MINTABLE" | "MINTED" | "COMING"
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

export async function getAchievements(characterId: number) {
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
              status: "COMING",
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
              status: "COMING",
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
  characterId: number
  achievementId: number
}) {
  return indexer.mintAchievement(input.characterId, input.achievementId)
}

export async function getMiraBalance(characterId: number, contract: Contract) {
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

export async function getGreenfieldId(cid: string) {
  const result = await (
    await fetch(`https://ipfs-relay.crossbell.io/map/ipfs2gnfd/${cid}`)
  ).json()

  return result
}
