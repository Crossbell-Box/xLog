import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { getFeed } from "~/queries/home.server"

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
    useImageDimensions: query.useImageDimensions === "true",
    topic: query.topic,
    translateTo: query.translateTo,
  })

  const res = new NextServerResponse()
  return res.status(200).json(result)
}
