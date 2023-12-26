import chroma from "chroma-js"

import { QueryClient } from "@tanstack/react-query"

import { getAverageColor } from "~/lib/fast-average-color-node"
import { toGateway } from "~/lib/ipfs-parser"
import { cacheGet } from "~/lib/redis.server"
import { ExpandedCharacter } from "~/lib/types"
import * as siteModel from "~/models/site.model"

import { SIMPLEHASH_API_KEY } from "../lib/env.server"

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

  return await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => siteModel.getSite(input),
    })
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
  if (!SIMPLEHASH_API_KEY || !address) {
    return null
  }

  return cacheGet({
    key: `nfts/${address}`,
    noUpdate: true,
    expireTime: 60 * 60 * 24,
    getValueFun: async () => {
      const chains = (
        (await (
          await fetch("https://api.simplehash.com/api/v0/chains", {
            headers: {
              "X-API-KEY": SIMPLEHASH_API_KEY,
              accept: "application/json",
            },
          })
        ).json()) as {
          chain: string
          is_testnet: boolean
        }[]
      )
        .filter((item) => !item.is_testnet)
        .map((item) => item.chain)
        .join(",")
      const result = await (
        await fetch(
          `https://api.simplehash.com/api/v0/nfts/owners_v2?${new URLSearchParams(
            {
              chains: chains,
              wallet_addresses: address,
              filters: "spam_score__lte=90",
              order_by: "floor_price__desc",
            },
          ).toString()}`,
          {
            headers: {
              "X-API-KEY": SIMPLEHASH_API_KEY,
              accept: "application/json",
            },
          },
        )
      ).json()
      while (result.next && result.nfts.length < 1000) {
        const next = await (
          await fetch(result.next, {
            headers: {
              "X-API-KEY": SIMPLEHASH_API_KEY,
              accept: "application/json",
            },
          })
        ).json()
        result.nfts = result.nfts.concat(next.nfts)
        result.next = next.next
      }
      return {
        nfts: result.nfts,
        chains: chains.split(","),
      }
    },
  }) as Promise<{
    nfts: {
      nft_id: string
      chain: string
      contract_address: string
      token_id: string
      name: string
      description: string
      previews: {
        image_small_url: string
        image_medium_url: string
        image_large_url: string
        image_opengraph_url: string
        blurhash: string
        predominant_color: string
      }
      external_url?: string
      collection?: {
        external_url?: string
        marketplace_pages?: {
          nft_url?: string
          collection_url?: string
        }[]
      }
    }[]
    chains: string[]
  }>
}

export const getCharacterColors = async (character?: ExpandedCharacter) => {
  const key = ["getThemeColors", character?.metadata?.uri]
  if (!character) {
    return null
  }
  return cacheGet({
    key,
    noExpire: true,
    noUpdate: true,
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

export const getBlockNumber = async (queryClient: QueryClient) => {
  const key = ["getBlockNumber"]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet({
      key: key,
      getValueFun: async () => {
        return siteModel.getBlockNumber()
      },
    })
  })
}
