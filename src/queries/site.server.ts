import { QueryClient } from "@tanstack/react-query"

import { cacheGet } from "~/lib/redis.server"
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
