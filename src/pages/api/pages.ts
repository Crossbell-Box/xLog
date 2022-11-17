import { NextApiRequest, NextApiResponse } from "next"
import { getPagesBySite } from "~/models/page.model"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query

  const result = await getPagesBySite(query as any)

  res.status(200).json(result)
}
