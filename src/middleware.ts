import { NextRequest, NextResponse } from "next/server"
import { IS_PROD } from "~/lib/constants"
import { DISCORD_LINK } from "~/lib/env"
import { FLY_REGION, IS_PRIMARY_REGION, PRIMARY_REGION } from "~/lib/env.server"
import { getTenant } from "~/lib/tenant.server"

const METHODS_TO_NOT_REPLAY = ["GET", "HEAD", "OPTIONS"]

const ALWAYS_REPLAY_ROUTES = [
  "/api/login",
  "/api/login-complete",
  "/api/logout",
]

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log(
    `x-forwarded-proto: ${req.headers.get(
      "x-forwarded-proto",
    )}, cf-visitor: ${req.headers.get("cf-visitor")}`,
  )
  if (IS_PROD && req.headers.get("x-forwarded-proto") !== "https") {
    let cfHttps = false
    try {
      if (
        JSON.parse(req.headers.get("cf-visitor") || "{}").scheme === "https"
      ) {
        cfHttps = true
      }
    } catch (error) {}
    if (!cfHttps) {
      return NextResponse.redirect(
        `https://${req.headers.get("host")}${req.nextUrl.pathname}${
          req.nextUrl.search
        }`,
        301,
      )
    }
  }

  console.log(`${req.method} ${req.nextUrl.pathname}${req.nextUrl.search}`)

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/_next") ||
    pathname === "/ipfs-gateway-sw.js"
  ) {
    return NextResponse.next()
  }

  const tenant = await getTenant(req, req.nextUrl.searchParams)

  if (tenant?.redirect && IS_PROD) {
    return NextResponse.redirect(
      `${tenant.redirect}${req.nextUrl.pathname}${req.nextUrl.search}`,
    )
  }

  if (tenant?.subdomain) {
    const url = req.nextUrl.clone()
    url.pathname = `/_site/${tenant?.subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  if (DISCORD_LINK && pathname === "/discord") {
    return NextResponse.redirect(DISCORD_LINK)
  }

  return NextResponse.next()
}
