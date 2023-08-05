import ogs from "open-graph-scraper"

import { NextServerResponse, getQuery } from "~/lib/server-helper"

export async function GET(req: Request) {
  const query = getQuery(req)

  const result = await ogs({
    url: query.url,
  })
  const res = new NextServerResponse()
  return res.status(200).json(result)
}
