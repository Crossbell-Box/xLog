import * as pageModel from "~/models/page.model"
import { QueryClient } from "@tanstack/react-query"
import { cacheGet } from "~/lib/redis.server"
import { getIdBySlug } from "~/pages/api/slug2id"

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
    return cacheGet(key, () => pageModel.getPage(input))
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
      return cacheGet(key, () =>
        pageModel.getPagesBySite({
          ...input,
          cursor: pageParam,
        }),
      )
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
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
