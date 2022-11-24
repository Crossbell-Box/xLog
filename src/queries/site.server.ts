import * as siteModel from "~/models/site.model"
import { QueryClient } from "@tanstack/react-query"
import { cacheGet } from "~/lib/redis.server"

export const prefetchGetSite = async (
  input: string,
  queryClient: QueryClient,
) => {
  const key = ["getSite", input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getSite(input))
  })
}

export const fetchGetSite = async (input: string, queryClient: QueryClient) => {
  const key = ["getSite", input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getSite(input))
  })
}

export const prefetchGetSiteSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteSubscriptions", input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getSiteSubscriptions(input))
  })
}

export const prefetchGetSiteToSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteToSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteToSubscriptions", input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getSiteToSubscriptions(input))
  })
}

export const prefetchGetSites = async (
  input: string[],
  queryClient: QueryClient,
) => {
  const key = ["getSites", input]
  await queryClient.fetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getSites(input))
  })
}

export const fetchGetNotifications = async (
  data: { siteCId?: string },
  queryClient: QueryClient,
) => {
  const key = ["getNotifications", data]
  if (!data.siteCId) {
    return null
  }
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet(key, () =>
      siteModel.getNotifications({
        siteCId: data.siteCId!,
      }),
    )
  })
}

export const prefetchGetUserSites = async (
  address: string,
  queryClient: QueryClient,
) => {
  const key = ["getUserSites", address]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getUserSites(address))
  })
}
