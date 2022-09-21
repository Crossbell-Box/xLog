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

export const fetchGetSite = async (input: string) => {
  const key = ["getSite", input]
  const data: ReturnType<typeof siteModel.getSite> | undefined =
    queryClientServer.getQueryData(key)
  if (!data) {
    return await queryClientServer.fetchQuery(["getSite", input], async () => {
      return siteModel.getSite(input)
    })
  } else {
    queryClientServer.fetchQuery(["getSite", input], async () => {
      return siteModel.getSite(input)
    })
    return data
  }
}

export const prefetchGetSiteSubscriptions = async (
  input: Parameters<typeof siteModel.getSiteSubscriptions>[0],
) => {
  const key = ["getSite", input]
  const data = queryClientServer.getQueryData(key)
  if (!data) {
    await queryClientServer.prefetchQuery(
      ["getSiteSubscriptions", input],
      async () => {
        return siteModel.getSiteSubscriptions(input)
      },
    )
  } else {
    queryClientServer.prefetchQuery(
      ["getSiteSubscriptions", input],
      async () => {
        return siteModel.getSiteSubscriptions(input)
      },
    )
  }
}
