"use client"

import { usePathname } from "next/navigation"

import { i18nConfig } from "../../next.i18n"

export const useCurrentLocale = (): string | undefined => {
  const { basePath = "", locales } = i18nConfig

  const currentPathname = usePathname()

  const locale = locales.find((locale) => {
    // remove trailing slash if present
    let base = basePath.replace(/\/$/, "")
    // server does not include basePath in usePathname
    // https://github.com/vercel/next.js/issues/46562
    if (typeof window === "undefined") {
      base = ""
    }

    return (
      currentPathname === `${base}/${locale}` ||
      currentPathname.startsWith(`${base}/${locale}/`)
    )
  })

  if (locale) {
    return locale
  }

  if (!i18nConfig.prefixDefault) {
    return i18nConfig.defaultLocale
  } else {
    return undefined
  }
}
