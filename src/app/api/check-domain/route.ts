import { NextResponse } from "next/server"

import { NextServerResponse, getQuery } from "~/lib/server-helper"
import { checkDomainServer } from "~/models/site.model"

export async function GET(req: Request) {
  const { handle, domain } = getQuery(req)

  if (!handle || !domain) {
    NextResponse.json({ error: "Missing characterId or domain" })
    return
  }
  const res = new NextServerResponse()

  return res.status(200).json({
    data: await checkDomainServer(domain as string, handle as string),
  })
}
