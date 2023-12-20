import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"

import { getClientIp } from "@supercharge/request-ip"

import { IS_PROD } from "~/lib/constants"

import { defaultLocale, locales } from "./i18n"
import { Language } from "./lib/types"

// HTTPWhiteListPaths: White list of path for plain http request, no HTTPS redirect
const HTTPWhitelistPaths = ["/api/healthcheck"]

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next", "_vercel"
  matcher: ["/((?!api|_next|_vercel|assets).*)"],
}

export async function middleware(req: NextRequest) {
  const handleI18nRouting = createMiddleware<Language[]>({
    locales,
    defaultLocale,
    localePrefix: "never",
  })

  const { pathname } = req.nextUrl

  const searchParams = new URLSearchParams(req.nextUrl.search)
  const specifiedLocale = searchParams.get("locale") as Language | undefined

  if (specifiedLocale && locales.includes(specifiedLocale)) {
    req.cookies.set("NEXT_LOCALE", specifiedLocale)
  }

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

  const response = handleI18nRouting(req)

  // https://github.com/vercel/next.js/issues/46618#issuecomment-1450416633
  response.headers.set("x-xlog-pathname", pathname)
  response.headers.set("x-xlog-search", req.nextUrl.search)
  response.headers.set("x-xlog-ip", getClientIp(req) || "")

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/locales/") ||
    pathname.startsWith("/site/") ||
    pathname.match(/^\/(workbox|worker|fallback)-\w+\.js(\.map)?$/) ||
    pathname === "favicon.ico"
  ) {
    return response
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

  response.headers.set("x-xlog-handle", tenant.subdomain || "")

  if (tenant?.subdomain) {
    const newResponse = NextResponse.rewrite(
      new URL(
        `/${response.headers.get(
          "x-middleware-request-x-next-intl-locale",
        )}/site/${tenant?.subdomain}${pathname === "/" ? "" : pathname}${
          req.nextUrl.search
        }`,
        req.url,
      ),
    )
    response.headers.forEach((value, key) => {
      if (key !== "x-middleware-rewrite") {
        newResponse.headers.set(key, value)
      }
    })
    return newResponse
  }

  return response
}
