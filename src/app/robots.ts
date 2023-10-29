import { MetadataRoute } from "next"
import { i18nConfig } from "next.i18n"

const localePrefixes = ["", ...i18nConfig.locales].map((locale) =>
  locale ? `/${locale}` : "",
)
const disallowPaths = ["/dashboard/", "/preview/"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: localePrefixes.reduce((disallow, locale) => {
        disallowPaths.forEach((path) => {
          disallow.push(`${locale}${path}`)
        })
        return disallow
      }, [] as string[]),
    },
  }
}
