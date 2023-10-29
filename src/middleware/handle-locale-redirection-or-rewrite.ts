import { NextRequest, NextResponse } from "next/server"

import { i18nConfig } from "~/lib/i18n/config"

const {
  basePath,
  localeCookie,
  localeDetector,
  defaultLocale,
  locales,
  prefixDefault,
} = i18nConfig

export function handleLocaleRedirectionOrRewrite(
  req: NextRequest,
  options: {
    pathLocale?: string
    pathname?: string
  } = {
    pathLocale: "",
    pathname: "",
  },
) {
  const { pathLocale = "", pathname = "" } = options

  const basePathTrailingSlash = basePath?.endsWith("/")

  const { search } = req.nextUrl

  if (!pathLocale) {
    let locale

    // check cookie for locale
    if (localeCookie) {
      const cookieValue = req.cookies.get(localeCookie)?.value

      if (cookieValue && i18nConfig.locales.includes(cookieValue)) {
        locale = cookieValue
      }
    }

    // if no cookie, detect locale with localeDetector
    if (!locale) {
      if (localeDetector === false) {
        locale = defaultLocale
      } else {
        locale = localeDetector?.(req, i18nConfig)
      }
    }

    if (!locales.includes(locale!)) {
      console.warn(
        "The localeDetector callback must return a locale included in your locales array. Reverting to using defaultLocale.",
      )

      locale = defaultLocale
    }

    let newPath = `${locale}${pathname}`

    newPath = `${basePath}${basePathTrailingSlash ? "" : "/"}${newPath}`

    if (search) {
      newPath += search
    }

    // redirect to prefixed path
    if (prefixDefault || locale !== defaultLocale) {
      return NextResponse.redirect(new URL(newPath, req.url))
    }

    // If we get here, we're using the defaultLocale.
    if (!prefixDefault) {
      return NextResponse.rewrite(new URL(newPath, req.url))
    }
  } else {
    let pathWithoutLocale = pathname.slice(`/${defaultLocale}`.length) || "/"

    if (basePathTrailingSlash) {
      pathWithoutLocale = pathWithoutLocale.slice(1)
    }

    if (search) {
      pathWithoutLocale += search
    }

    // If /default, redirect to /
    if (!prefixDefault && pathLocale === defaultLocale) {
      return NextResponse.redirect(
        new URL(`${basePath}${pathWithoutLocale}`, req.url),
      )
    }
  }
}
