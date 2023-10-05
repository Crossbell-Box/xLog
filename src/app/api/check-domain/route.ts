import { NextResponse } from "next/server"

import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { checkDomainServer } from "~/models/site.model"

// /api/check-domain?handle=innei-4525&domain=blog.innei.ren
export async function GET(req: Request): Promise<Response> {
  const { handle, domain } = getQuery(req)

  if (!handle || !domain) {
    return NextResponse.json({ error: "Missing characterId or domain" })
  }
  const res = new NextServerResponse()

  return res.status(200).json({
    data: await checkDomainServer(domain as string, handle as string),
  })
}
