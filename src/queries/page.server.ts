import * as pageModel from "~/models/page.model"
import { queryClientServer } from "~/lib/query-client.server"

export const fetchGetPage = async (input: Parameters<typeof pageModel.getPage>[0]) => {
  return await queryClientServer.fetchQuery(['getPage', input.page, input], async () => {
      return pageModel.getPage(input)
  })
}

export const prefetchGetPagesBySite = async (input: Parameters<typeof pageModel.getPagesBySite>[0]) => {
  await queryClientServer.fetchQuery(['getPagesBySite', input.site, input], async () => {
      return pageModel.getPagesBySite(input)
  })
}
