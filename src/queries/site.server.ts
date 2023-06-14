import chroma from "chroma-js"
import { getAverageColor } from "fast-average-color-node"
import { Asset } from "unidata.js"

import { QueryClient } from "@tanstack/react-query"

import { IPFS_GATEWAY } from "~/lib/env"
import { toGateway } from "~/lib/ipfs-parser"
import { cacheGet, getRedis } from "~/lib/redis.server"
import { ExpandedCharacter } from "~/lib/types"
import * as siteModel from "~/models/site.model"
import unidata from "~/queries/unidata.server"

export const prefetchGetSite = async (
  input: string,
  queryClient: QueryClient,
) => {
  const key = ["getSite", input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => siteModel.getSite(input),
    })
  })
}

export const fetchGetSite = async (
  input: string,
  queryClient: QueryClient,
): Promise<ReturnType<typeof siteModel.getSite>> => {
  const key = ["getSite", input]

  // https://github.com/vercel/next.js/blob/8d228780e72706ef4bd5b6327ede2c0340181353/packages/next/src/lib/metadata/resolvers/resolve-opengraph.ts#L49-L51
  // Next.js will mutate objects in place. The fetch result will be cached by Next.js as well.
  // Consequently, when we pass site into `generateMetadata`, `site.metadata.content.avatars` will be replaced with `URL` by Next.js.
  // To resolve this issue, we return a new object every time `fetchGetSite` is used.
  // Remove this temporary solution once https://github.com/vercel/next.js/issues/49501 has been resolved.
  return JSON.parse(
    JSON.stringify(
      await queryClient.fetchQuery(key, async () => {
        return cacheGet({
          key,
          getValueFun: () => siteModel.getSite(input),
        })
      }),
    ),
  )
}

export const prefetchGetSiteSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteSubscriptions", input]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      return cacheGet({
        key,
        getValueFun: () => {
          return siteModel.getSiteSubscriptions({
            characterId: input.characterId,
            cursor: pageParam,
          })
        },
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export const prefetchGetSiteToSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteToSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteToSubscriptions", input]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      return cacheGet({
        key,
        getValueFun: () => {
          return siteModel.getSiteToSubscriptions({
            ...input,
            cursor: pageParam,
          })
        },
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export const fetchGetComments = async (
  data: Parameters<typeof siteModel.getCommentsBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getComments", data]
  if (!data.characterId) {
    return null
  }
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () =>
        siteModel.getCommentsBySite({
          characterId: data.characterId,
        }),
    }) as Promise<ReturnType<typeof siteModel.getCommentsBySite>>
  })
}

export const getNFTs = async (address?: string) => {
  const redis = await getRedis()
  const redisKey = `nfts/${address}`

  if (!address) {
    return null
  }

  let cache
  try {
    cache = await redis?.get(redisKey)
  } catch (error) {}
  if (cache) {
    return JSON.parse(cache)
  } else {
    const result = await unidata.assets.get({
      source: "Ethereum NFT",
      identity: address,
    })
    await Promise.all(
      result.list.map(async (nft: Asset) => {
        if (!nft.items?.[0].mime_type && nft.items?.[0]?.address) {
          try {
            new URL(nft.items[0].address)
          } catch (error) {
            return nft
          }
          try {
            const mime_type = await cacheGet({
              key: `nft-mimetype/${nft.items[0].address}`,
              getValueFun: async () => {
                const head = await fetch(
                  `${nft.items![0].address!.replace(
                    IPFS_GATEWAY,
                    "https://gateway.ipfs.io/ipfs/",
                  )}`,
                  {
                    method: "HEAD",
                  },
                )
                return head.headers.get("content-type")
              },
            })
            nft.items[0].mime_type = mime_type
          } catch (error) {
            console.warn(error)
          }
        }
        return nft
      }),
    )
    redis?.set(redisKey, JSON.stringify(result), "EX", 60 * 60 * 24)
    return result
  }
}

export const getCharacterColors = async (character?: ExpandedCharacter) => {
  const key = ["getThemeColors", character?.handle]
  if (!character) {
    return null
  }
  return cacheGet({
    key,
    getValueFun: async () => {
      let colors = {}

      try {
        if (
          character.metadata?.content?.banners?.[0]?.mime_type?.split(
            "/",
          )[0] === "image"
        ) {
          const color = await getAverageColor(
            toGateway(
              character.metadata.content.banners[0].address,
              "https://cloudflare-ipfs.com/ipfs/",
            ),
          )
          colors = {
            dark: {
              averageColor: chroma(color.hex).luminance(0.007).hex(),
              autoHoverColor: chroma(color.hex).luminance(0.02).hex(),
              autoThemeColor: chroma(color.hex)
                .saturate(3)
                .luminance(0.3)
                .hex(),
            },
            light: {
              averageColor: chroma(color.hex).hex(),
              autoHoverColor: chroma(color.hex).luminance(0.8).hex(),
              autoThemeColor: chroma(color.hex)
                .saturate(3)
                .luminance(0.3)
                .hex(),
            },
          }
        } else if (character.metadata?.content?.avatars?.[0]) {
          const color = await getAverageColor(
            toGateway(
              character.metadata.content.avatars[0],
              "https://cloudflare-ipfs.com/ipfs/",
            ),
          )
          colors = {
            dark: {
              averageColor: chroma(color.hex).luminance(0.007).hex(),
              autoHoverColor: chroma(color.hex).luminance(0.02).hex(),
              autoThemeColor: chroma(color.hex)
                .saturate(3)
                .luminance(0.3)
                .hex(),
            },
            light: {
              averageColor: chroma(color.hex).luminance(0.95).hex(),
              autoHoverColor: chroma(color.hex).luminance(0.8).hex(),
              autoThemeColor: chroma(color.hex)
                .saturate(3)
                .luminance(0.3)
                .hex(),
            },
          }
        }
      } catch (error) {}

      return colors
    },
  }) as Promise<{
    dark?: {
      averageColor?: string
      autoHoverColor?: string
      autoThemeColor?: string
    }
    light?: {
      averageColor?: string
      autoHoverColor?: string
      autoThemeColor?: string
    }
  }>
}
