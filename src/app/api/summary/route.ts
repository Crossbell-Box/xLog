import { NextServerResponse, getQuery } from "~/lib/server-helper"
import { getSummary } from "~/queries/page.server"

export async function GET(req: Request): Promise<Response> {
  let { cid, lang } = getQuery(req)
  const res = new NextServerResponse()

  if (!cid) {
    return res.status(400).send("Bad Request")
  }

  return res.status(200).json({
    data: await getSummary({
      cid,
      lang,
    }),
  })
}
