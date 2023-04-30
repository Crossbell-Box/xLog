import { QueryClient } from "@tanstack/react-query"

import { cacheGet } from "~/lib/redis.server"
import * as pageModel from "~/models/page.model"
import { getIdBySlug } from "~/pages/api/slug2id"
import { getSummary } from "~/pages/api/summary"

export const fetchGetPage = async (
  input: Parameters<typeof pageModel.getPage>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPage", input.page, input]
  return await queryClient.fetchQuery(key, async () => {
    if (!input.pageId) {
      if (!input.page || !input.site) {
        return null
      }
      const slug2Id = await getIdBySlug(input.page, input.site)
      if (!slug2Id?.noteId) {
        return null
      }
      input.pageId = `${slug2Id.characterId}-${slug2Id.noteId}`
    }
    delete input.page
    return cacheGet({
      key,
      getValueFun: () => pageModel.getPage(input),
    }) as Promise<ReturnType<typeof pageModel.getPage>>
  })
}

export const prefetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.site, input]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      return cacheGet({
        key,
        getValueFun: () =>
          pageModel.getPagesBySite({
            ...input,
            cursor: pageParam,
          }),
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const fetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.site, input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => pageModel.getPagesBySite(input),
    }) as Promise<ReturnType<typeof pageModel.getPagesBySite>>
  })
}

export const prefetchGetSummary = async (
  input: { cid?: string; lang?: string },
  queryClient: QueryClient,
) => {
  const key = ["getSummary", input.cid, input.lang]
  await queryClient.fetchQuery(key, async () => {
    if (!input.cid || !input.lang) {
      return
    }
    return getSummary(input.cid, input.lang)
  })
}
