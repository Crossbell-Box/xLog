import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "~/lib/tenant.server"

const SG_REGIONS = ["HK", "TW", "SG", "CN", "JP"]

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const tenant = getTenant(req, req.nextUrl.searchParams)

  if (req.geo?.country && SG_REGIONS.includes(req.geo.country)) {
    const url = req.nextUrl.clone()
    url.hostname = "proselog-sg.vercel.app"
    if (tenant) {
      url.searchParams.set("tenant", tenant)
    }
    return NextResponse.rewrite(url)
  }

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
