import * as pageModel from "~/models/page.model"
import { queryClientServer } from "~/lib/query-client.server"

export const fetchGetPage = async (
  input: Parameters<typeof pageModel.getPage>[0],
) => {
  const key = ["getPage", input.page, input]
  const data: ReturnType<typeof pageModel.getPage> | undefined =
    queryClientServer.getQueryData(key)
  if (!data) {
    return await queryClientServer.fetchQuery(key, async () => {
      return pageModel.getPage(input)
    })
  } else {
    queryClientServer.prefetchQuery(key, async () => {
      return pageModel.getPage(input)
    })
    return data
  }
}

export const prefetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  const key = ["getPagesBySite", input.site, input]
  const data = queryClientServer.getQueryData(key)
  if (!data) {
    await queryClientServer.prefetchQuery(key, async () => {
      return pageModel.getPagesBySite(input)
    })
  } else {
    queryClientServer.prefetchQuery(key, async () => {
      return pageModel.getPagesBySite(input)
    })
  }
}

export const fetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  const key = ["getPagesBySite", input.site, input]
  const data: ReturnType<typeof pageModel.getPagesBySite> | undefined =
    queryClientServer.getQueryData(key)
  if (!data) {
    return await queryClientServer.fetchQuery(key, async () => {
      return pageModel.getPagesBySite(input)
    })
  } else {
    queryClientServer.fetchQuery(key, async () => {
      return pageModel.getPagesBySite(input)
    })
    return data
  }
}
