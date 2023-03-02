import * as siteModel from "~/models/site.model"
import { QueryClient } from "@tanstack/react-query"
import { cacheGet } from "~/lib/redis.server"

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
    })
  })
}

export const prefetchGetSiteSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteSubscriptions", input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => siteModel.getSiteSubscriptions(input),
    })
  })
}

export const prefetchGetSiteToSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteToSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteToSubscriptions", input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => siteModel.getSiteToSubscriptions(input),
    })
  })
}

export const prefetchGetSites = async (
  input: string[],
  queryClient: QueryClient,
) => {
  const key = ["getSites", input]
  await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => siteModel.getSites(input),
    })
  })
}
