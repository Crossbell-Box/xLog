import { NextApiRequest, NextApiResponse } from "next"
import { checkDomainServer } from "~/models/site.model"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { handle, domain } = req.query

  if (!handle || !domain) {
    res.status(400).json({ error: "Missing characterId or domain" })
    return
  }

  res.status(200).json({
    data: await checkDomainServer(domain as string, handle as string),
  })
}
