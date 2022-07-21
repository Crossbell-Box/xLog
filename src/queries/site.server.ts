import * as siteModel from "~/models/site.model"
import { QueryClient } from '@tanstack/react-query'

const queryClientServer = new QueryClient()
const cacheMaxAge = parseInt(process.env.CACHE_MAX_AGE || "600000")

export const queryClient = queryClientServer

export const prefetchGetSite = async (input: string) => {
  await queryClientServer.prefetchQuery(['getSite', input], async () => {
      return siteModel.getSite(input)
  }, { staleTime: cacheMaxAge })
}