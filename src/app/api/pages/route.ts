import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { PagesSortTypes, PageVisibilityEnum } from "~/lib/types"
import { getPagesBySite } from "~/models/page.model"

export async function GET(req: Request) {
  const query = getQuery(req)

  const result = await getPagesBySite({
    characterId: +(query.characterId || 0) as number,
    type: query.type,
    visibility: query.visibility as PageVisibilityEnum,
    limit: query.limit ? parseInt(query.limit as string) : undefined,
    cursor: query.cursor as string,
    useStat: true,
    useImageDimensions: query.useImageDimensions === "true",
    skipExpansion: query.skipExpansion === "true",
    sortType: query.sortType as PagesSortTypes,
    ...(query.tags && {
      tags: Array.isArray(query.tags)
        ? (query.tags as string[])
        : [query.tags as string],
    }),
  })

  const res = new NextServerResponse()
  return res.status(200).json(result)
}

export const dynamic = "force-dynamic"
