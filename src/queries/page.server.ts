import * as pageModel from "~/models/page.model"
import { QueryClient } from "@tanstack/react-query"
import { cacheGet } from "~/lib/redis.server"

export const fetchGetPage = async (
  input: Parameters<typeof pageModel.getPage>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPage", input.page, input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet(key, () => pageModel.getPage(input))
  })
}

export const prefetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.site, input]
  await queryClient.prefetchQuery(key, async () => {
    return cacheGet(key, () => pageModel.getPagesBySite(input))
  })
}

export const fetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.site, input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet(key, () => pageModel.getPagesBySite(input))
  })
}
