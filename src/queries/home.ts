import { useInfiniteQuery } from "@tanstack/react-query"

import * as homeModel from "~/models/home.model"

export const useGetFeed = (data?: {
  type?: "latest" | "recommend" | "following"
  characterId?: number
  limit?: number
}) => {
  return useInfiniteQuery({
    queryKey: ["getFeed", data],
    queryFn: async ({ pageParam }) => {
      return homeModel.getFeed({
        ...data,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}
