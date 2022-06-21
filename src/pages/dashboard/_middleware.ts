import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME } from "~/lib/env.server"

export default function middleware(req: NextRequest) {
  // Redirect unauthenticated users to the home page
  // if (!req.cookies[AUTH_COOKIE_NAME]) {
  //   const url = req.nextUrl.clone()
  //   url.pathname = "/"
  //   return NextResponse.redirect(url)
  // }
  return NextResponse.next()
}
