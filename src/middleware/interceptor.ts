import { NextResponse } from "next/server"

export function interceptor(pathname: string, requestHeaders: Headers) {
  // Intercepts the following paths.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/locales/") ||
    pathname.match(/^\/(workbox|worker|fallback)-\w+\.js(\.map)?$/) ||
    pathname === "/sw.js" ||
    pathname === "/sw.js.map" ||
    pathname === "/monitoring" ||
    pathname === "favicon.ico"
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }
}
