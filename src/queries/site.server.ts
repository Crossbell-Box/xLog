import * as siteModel from "~/models/site.model"
import { queryClientServer, cacheMaxAge } from "~/queries/server"

export const queryClient = queryClientServer

export const prefetchGetSite = async (input: string) => {
  await queryClientServer.prefetchQuery(['getSite', input], async () => {
      return siteModel.getSite(input)
  }, { staleTime: cacheMaxAge })
}