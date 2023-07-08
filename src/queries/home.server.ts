import { QueryClient } from "@tanstack/react-query"

import { cacheGet } from "~/lib/redis.server"
import * as homeModel from "~/models/home.model"

export const prefetchGetFeed = async (
  data: Parameters<typeof homeModel.getFeed>[0],
  queryClient: QueryClient,
) => {
  const key = ["getFeed", data]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      return cacheGet({
        key,
        getValueFun: () =>
          homeModel.getFeed({
            ...data,
            cursor: pageParam,
          }),
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export const prefetchGetShowcase = async (queryClient: QueryClient) => {
  const key = ["getShowcase"]
  await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => homeModel.getShowcase(),
    })
  })
}
