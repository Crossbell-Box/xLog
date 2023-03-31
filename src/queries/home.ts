import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import * as homeModel from "~/models/home.model"

export const useGetFeed = (data?: {
  type?: "latest" | "recommend" | "following" | "topic"
  characterId?: number
  limit?: number
  noteIds?: string[]
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
