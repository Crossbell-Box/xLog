import { NextRequest, NextResponse } from "next/server"

import { getClientIp } from "@supercharge/request-ip"

import { IS_PROD } from "~/lib/constants"
import { DISCORD_LINK } from "~/lib/env"

import { getAcceptLang } from "./lib/accept-lang"
import { i18nConfig } from "./lib/i18n/config"
import { withLocaleFactory } from "./lib/i18n/with-locale"
import { handleLocaleRedirectionOrRewrite } from "./middleware/handle-locale-redirection-or-rewrite"
import { handleTenantRedirectionOrRewrite } from "./middleware/handle-tenant-redirection-or-rewrite"
import { interceptor } from "./middleware/interceptor"

// HTTPWhiteListPaths: White list of path for plain http request, no HTTPS redirect
const HTTPWhitelistPaths = ["/api/healthcheck"]

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const { locales } = i18nConfig

  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  // https://github.com/vercel/next.js/issues/46618#issuecomment-1450416633
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-xlog-pathname", pathname)
  requestHeaders.set("x-xlog-search", search)
  requestHeaders.set("x-xlog-ip", getClientIp(req) || "")

  // Generate withLocale function with default options.
  const withLocale = withLocaleFactory({
    pathLocale,
    defaultLocale: getAcceptLang(),
  })

  console.log("=====！！！！！！", {
    req,
    pathname,
    ppppp: req.cookies.get("locale"),
    pathLocale,
    defaultLocale: getAcceptLang(),
  })

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
      //   `https://${req.headers.get("host")}${pathname}${search}`,
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
      }${withLocale("/feed")}`,
      301,
    )
  }

  // Intercepts some paths that do not need the locale prefix
  const interceptorResponse = interceptor(pathname, requestHeaders)
  if (interceptorResponse) {
    return interceptorResponse
  }

  // Handle tenant redirection or rewrite
  const responseWithHandledTenant = await handleTenantRedirectionOrRewrite(
    req,
    {
      withLocale,
      pathname,
      search,
      requestHeaders,
    },
  )
  if (responseWithHandledTenant) return responseWithHandledTenant

  // Handle locale redirection or rewrite
  const responseWithHandledLocale = handleLocaleRedirectionOrRewrite(req, {
    pathLocale,
    pathname,
    requestHeaders,
  })
  if (responseWithHandledLocale) return responseWithHandledLocale

  if (
    pathname.startsWith(withLocale("/dashboard")) ||
    pathname.startsWith(withLocale("/site/"))
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (DISCORD_LINK && pathname === "/discord") {
    return NextResponse.redirect(DISCORD_LINK)
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}
