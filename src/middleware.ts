import { NextRequest, NextResponse } from "next/server"

import { getClientIp } from "@supercharge/request-ip"

import { IS_PROD } from "~/lib/constants"
import { DISCORD_LINK } from "~/lib/env"

// HTTPWhiteListPaths: White list of path for plain http request, no HTTPS redirect
const HTTPWhitelistPaths = ["/api/healthcheck"]

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // https://github.com/vercel/next.js/issues/46618#issuecomment-1450416633
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-xlog-pathname", pathname)
  requestHeaders.set("x-xlog-search", req.nextUrl.search)
  requestHeaders.set("x-xlog-ip", getClientIp(req) || "")

  console.log(
    `x-forwarded-proto: ${req.headers.get(
      "x-forwarded-proto",
    )}, cf-visitor: ${req.headers.get("cf-visitor")}`,
  )
  if (
    IS_PROD &&
    req.headers.get("x-forwarded-proto") !== "https" &&
    !HTTPWhitelistPaths.includes(pathname)
  ) {
    let cfHttps = false
    try {
      if (
        JSON.parse(req.headers.get("cf-visitor") || "{}").scheme === "https"
      ) {
        cfHttps = true
      }
    } catch (error) {
      console.error(error)
    }
    if (!cfHttps) {
      // return NextResponse.redirect(
      //   `https://${req.headers.get("host")}${req.nextUrl.pathname}${
      //     req.nextUrl.search
      //   }`,
      //   301,
      // )
    }
  }

  if (
    pathname === "/feed.xml" ||
    pathname === "/atom.xml" ||
    pathname === "/feed/xml"
  ) {
    return NextResponse.redirect(
      `https://${
        req.headers.get("x-forwarded-host") || req.headers.get("host")
      }/feed`,
      301,
    )
  }

  console.debug(`${req.method} ${req.nextUrl}`)

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/locales/") ||
    pathname.startsWith("/site/") ||
    pathname.match(/^\/(workbox|worker|fallback)-\w+\.js(\.map)?$/) ||
    pathname === "/sw.js" ||
    pathname === "/sw.js.map" ||
    pathname === "/monitoring" ||
    pathname === "favicon.ico"
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  let tenant: {
    subdomain?: string
    redirect?: string
  } = {}
  try {
    tenant = await (
      await fetch(
        new URL(
          `/api/host2handle?host=${
            req.headers.get("x-forwarded-host") || req.headers.get("host")
          }`,
          req.url,
        ),
      )
    ).json()
  } catch (error) {
    console.error(error)
  }

  if (tenant?.redirect && IS_PROD && !pathname.startsWith("/feed")) {
    return NextResponse.redirect(
      `${tenant.redirect}${req.nextUrl.pathname}${req.nextUrl.search}`,
    )
  }

  requestHeaders.set("x-xlog-handle", tenant.subdomain || "")

  if (tenant?.subdomain) {
    return NextResponse.rewrite(
      new URL(
        `/site/${tenant?.subdomain}${pathname === "/" ? "" : pathname}${
          req.nextUrl.search
        }`,
        req.url,
      ),
      {
        request: {
          headers: requestHeaders,
        },
      },
    )
  }

  if (DISCORD_LINK && pathname === "/discord") {
    return NextResponse.redirect(DISCORD_LINK)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
