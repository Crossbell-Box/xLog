import * as siteModel from "~/models/site.model"
import { QueryClient } from "@tanstack/react-query"

export const prefetchGetSite = async (
  input: string,
  queryClient: QueryClient,
) => {
  const key = ["getSite", input]
  await queryClient.prefetchQuery(key, async () => {
    return siteModel.getSite(input)
  })
}

export const fetchGetSite = async (input: string, queryClient: QueryClient) => {
  const key = ["getSite", input]
  return await queryClient.fetchQuery(key, async () => {
    return siteModel.getSite(input)
  })
}

export const prefetchGetSiteSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteSubscriptions>[0],
  queryClient: QueryClient,
) => {
  const key = ["getSiteSubscriptions", input]
  await queryClient.prefetchQuery(key, async () => {
    return siteModel.getSiteSubscriptions(input)
  })
}
