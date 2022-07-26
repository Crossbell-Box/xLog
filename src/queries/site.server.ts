import * as siteModel from "~/models/site.model"
import { queryClientServer } from "~/lib/query-client.server"

export const prefetchGetSite = async (input: string) => {
  await queryClientServer.prefetchQuery(['getSite', input], async () => {
      return siteModel.getSite(input)
  })
}