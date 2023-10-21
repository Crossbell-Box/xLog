// This API is used to bypass the restriction that the Cloudflare Image Resizing service's onerror=redirect can only be used in current domain
import { redirect } from "next/navigation"
import { NextResponse, type NextRequest } from "next/server"

import { getQuery } from "~/lib/server-helper"

export const runtime = "edge"

export const GET = async (req: NextRequest) => {
  const query = getQuery(req)
  if (query.url) {
    redirect(query.url)
  } else {
    return NextResponse.json({ error: "Missing url" })
  }
}
