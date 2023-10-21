import ogs from "open-graph-scraper"

import { getQuery, NextServerResponse } from "~/lib/server-helper"

export async function GET(req: Request) {
  const query = getQuery(req)

  const { result } = await ogs({
    url: query.url,
  })

  if (result?.ogImage?.[0]) {
    let type = "image/png"
    if (result?.ogImage?.[0]?.type) {
      type = result?.ogImage?.[0]?.type?.startsWith("image/")
        ? result?.ogImage?.[0]?.type
        : `image/${result?.ogImage?.[0]?.type}`
    }
    result.ogImage[0].type = type

    if (result.ogImage[0].url.startsWith("//")) {
      result.ogImage[0].url = `https:${result.ogImage[0].url}`
    }
  }

  const res = new NextServerResponse()
  return res.status(200).json(result)
}
