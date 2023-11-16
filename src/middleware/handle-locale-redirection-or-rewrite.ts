import { NextRequest, NextResponse } from "next/server"

import { getAcceptLang } from "~/lib/accept-lang"
import { i18nConfig } from "~/lib/i18n/config"
import { Languages } from "~/lib/i18n/settings"

const { basePath, localeCookie, defaultLocale, locales } = i18nConfig

export function handleLocaleRedirectionOrRewrite(
  req: NextRequest,
  options: {
    pathLocale?: string
    pathname: string
    requestHeaders: Headers
  },
) {
  const { requestHeaders, pathLocale, pathname } = options

  const basePathTrailingSlash = basePath?.endsWith("/")

  const { search } = req.nextUrl

  if (!pathLocale) {
    let locale

    // check cookie for locale
    if (localeCookie) {
      const cookieValue = req.cookies.get(localeCookie)?.value as Languages

      if (cookieValue && i18nConfig.locales.includes(cookieValue)) {
        locale = cookieValue
      }
    }

    // if no cookie, detect locale with localeDetector
    if (!locale) {
      locale = getAcceptLang()
    }

    if (!locales.includes(locale as Languages)) {
      console.warn(
        "The localeDetector callback must return a locale included in the locales array. Reverting to using defaultLocale.",
      )

      locale = defaultLocale
    }

    let newPath = `${locale}${pathname}`

    newPath = `${basePath}${basePathTrailingSlash ? "" : "/"}${newPath}`

    if (search) {
      newPath += search
    }

    // If the target path does not include the locale code, rewrite to the new path with the detected locale code.
    // E.g. /about -> /en/about, /post -> /en/post
    return NextResponse.rewrite(new URL(newPath, req.url), {
      request: { headers: requestHeaders },
    })
  } else {
    let pathWithoutLocale = pathname.slice(`/${defaultLocale}`.length) || "/"

    if (basePathTrailingSlash) {
      pathWithoutLocale = pathWithoutLocale.slice(1)
    }

    if (search) {
      pathWithoutLocale += search
    }

    // If the target path includes the default locale code, redirect to the new path without the default locale code.
    // E.g. The current locale is en-US, /en-US/about -> /about, /en-US/post -> /post
    if (pathLocale === defaultLocale) {
      return NextResponse.redirect(
        new URL(`${basePath}${pathWithoutLocale}`, req.url),
        { headers: requestHeaders },
      )
    }
  }
}
