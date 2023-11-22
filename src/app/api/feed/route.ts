import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { getFeed } from "~/models/home.model"
import { decoratePageForImageDimensions } from "~/queries/page.server"

export async function GET(req: Request) {
  const query = getQuery(req)

  const result = await getFeed({
    type: query.type,
    cursor: query.cursor,
    limit: +query.limit || undefined,
    characterId: +query.characterId || undefined,
    daysInterval: +query.daysInterval || undefined,
    searchKeyword: query.searchKeyword,
    searchType: query.searchType,
    tag: query.tag,
    useHTML: false,
    topic: query.topic,
  })

  for (const item of result.list) {
    await decoratePageForImageDimensions(item)
  }

  const res = new NextServerResponse()
  return res.status(200).json(result)
}
