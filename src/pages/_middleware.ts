import { NextRequest, NextResponse } from "next/server"
import { IS_PROD } from "~/lib/constants"
import { S3_BUCKET_NAME, S3_ENDPOINT } from "~/lib/env.server"
import { getTenant } from "~/lib/tenant.server"

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!IS_PROD && pathname.startsWith("/dev-s3-proxy")) {
    const filename = req.nextUrl.searchParams.get("filename")
    console.log(`https://${S3_BUCKET_NAME}.${S3_ENDPOINT}/${filename}`)
    return NextResponse.rewrite(
      `https://${S3_BUCKET_NAME}.${S3_ENDPOINT}/${filename}`
    )
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  const tenant = getTenant(req)

  if (tenant) {
    const url = req.nextUrl.clone()
    url.pathname = `/_site/${tenant}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
