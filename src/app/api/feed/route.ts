import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { getFeed } from "~/models/home.model"
import {
  decoratePageForImageDimensions,
  decoratePageWithTranslation,
} from "~/queries/page.server"

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

  // TODO: It's a good idea to decorate the page maybe.
  for (const item of result.list) {
    await decoratePageForImageDimensions(item)
    await decoratePageWithTranslation(item)

    console.log(item?.metadata?.content?.imageDimensions, "=======")
  }

  const res = new NextServerResponse()
  return res.status(200).json(result)
}
