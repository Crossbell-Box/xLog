import { NextRequest, NextResponse } from "next/server"
import { IS_PROD } from "~/lib/constants"
import { FLY_REGION, IS_PRIMARY_REGION, PRIMARY_REGION } from "~/lib/env.server"
import { getTenant } from "~/lib/tenant.server"

const METHODS_TO_NOT_REPLAY = ["GET", "HEAD", "OPTIONS"]

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log(`${req.method} ${req.nextUrl.pathname}${req.nextUrl.search}`)

  if (
    IS_PROD &&
    !IS_PRIMARY_REGION &&
    !METHODS_TO_NOT_REPLAY.includes(req.method)
  ) {
    console.log("replayed", {
      PRIMARY_REGION,
      FLY_REGION,
      url: req.url,
    })
    return new Response("replayed", {
      headers: {
        "fly-replay": `region=${PRIMARY_REGION}`,
      },
    })
  }

  const tenant = getTenant(req, req.nextUrl.searchParams)

  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  if (tenant) {
    const url = req.nextUrl.clone()
    url.pathname = `/_site/${tenant}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
