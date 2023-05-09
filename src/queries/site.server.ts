import { Asset } from "unidata.js"

import { QueryClient } from "@tanstack/react-query"

import { IPFS_GATEWAY } from "~/lib/env"
import { cacheGet, getRedis } from "~/lib/redis.server"
import * as siteModel from "~/models/site.model"

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

export const fetchGetSite = async (input: string, queryClient: QueryClient) => {
  const key = ["getSite", input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => siteModel.getSite(input),
    }) as Promise<ReturnType<typeof siteModel.getSite>>
  })
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

  let cache
  try {
    cache = await redis?.get(redisKey)
  } catch (error) {}
  if (cache) {
    return JSON.parse(cache)
  } else {
    const result = await siteModel.getNFTs(address as string)
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
