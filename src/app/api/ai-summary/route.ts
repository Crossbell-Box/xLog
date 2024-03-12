import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { getSummary } from "~/queries/page.server"

export async function GET(req: Request): Promise<Response> {
  const query = getQuery(req)
  const res = new NextServerResponse()
  if (!query.cid || typeof query.cid !== "string") {
    return res.status(400).json({ error: "Missing cid" })
  }
  if (!query.lang || typeof query.lang !== "string") {
    return res.status(400).json({ error: "Missing lang" })
  }

  try {
    const summary = await getSummary({
      cid: query.cid,
      lang: query.lang,
    })
    return res.status(200).json({ summary })
  } catch (error) {
    return res.status(500).json({ error: "Could not get summary" })
  }
}
