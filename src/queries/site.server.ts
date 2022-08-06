import * as siteModel from "~/models/site.model"
import { queryClientServer } from "~/lib/query-client.server"

export const prefetchGetSite = async (input: string) => {
  const key = ["getSite", input]
  const data = queryClientServer.getQueryData(key)
  if (!data) {
    await queryClientServer.prefetchQuery(["getSite", input], async () => {
      return siteModel.getSite(input)
    })
  } else {
    queryClientServer.prefetchQuery(["getSite", input], async () => {
      return siteModel.getSite(input)
    })
  }
}
