import { QueryClient } from "@tanstack/react-query"

import * as homeModel from "~/models/home.model"

export const prefetchGetFeed = async (
  data: Parameters<typeof homeModel.getFeed>[0],
  queryClient: QueryClient,
) => {
  const key = ["getFeed", data]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) =>
      homeModel.getFeed({
        ...data,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export const getShowcase = async () => homeModel.getShowcase()
