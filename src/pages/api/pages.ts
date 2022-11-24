import { NextApiRequest, NextApiResponse } from "next"
import { getPagesBySite } from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query

  const result = await getPagesBySite({
    site: query.site as string,
    type: query.type as "post" | "page",
    visibility: query.visibility as PageVisibilityEnum,
    take: query.take ? parseInt(query.take as string) : undefined,
    cursor: query.cursor as string,
    useStat: true,
    ...(query.tags && {
      tags: Array.isArray(query.tags)
        ? (query.tags as string[])
        : [query.tags as string],
    }),
  })

  res.status(200).json(result)
}
