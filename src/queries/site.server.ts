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

export const prefetchGetSites = async (
  input: string[],
  queryClient: QueryClient,
) => {
  const key = ["getSites", input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet(key, () => siteModel.getSites(input))
  })
}
