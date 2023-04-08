import { QueryClient } from "@tanstack/react-query"
import { cacheGet } from "~/lib/redis.server"

import * as homeModel from "~/models/home.model"

export const prefetchGetFeed = async (
  data: {
    type?: homeModel.FeedType
    characterId?: number
    limit?: number
    noteIds?: string[]
  },
  queryClient: QueryClient,
) => {
  const key = ["getFeed", data]
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["getFeed", data],
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
