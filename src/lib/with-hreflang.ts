import { Metadata, ResolvingMetadata } from "next"
import { headers } from "next/headers"

import { defaultLocale, locales } from "~/i18n"

type BaseProps = {
  params?: Record<string, any>
  searchParams?: Record<string, string | string[] | undefined>
}

type GenerateMetadata<T = BaseProps> = (
  props: T,
  parent: ResolvingMetadata,
) => Promise<Metadata>

export function withHrefLang<T extends BaseProps>(
  _generateMetadata: GenerateMetadata<T>,
): GenerateMetadata<T> {
  return async function generateMetadata(
    props: T,
    parent: ResolvingMetadata,
  ): Promise<Metadata> {
    const metadata: Metadata = await _generateMetadata(props, parent)

    if (metadata.alternates) {
      const { locale } = props?.params || {}
      const protocol = headers().get("x-forwarded-proto") || ""
      const host = headers().get("x-forwarded-host") || ""
      const metadataBase = new URL(`${protocol}://${host}`)
      const path = headers().get("x-xlog-pathname") || ""

      const redirectedPathName = (locale: string) => {
        const search = headers().get("x-xlog-search") || ""
        const searchParams = new URLSearchParams(search)
        searchParams.set("locale", locale)

        return `${path}?${searchParams.toString()}`
      }

      metadata.metadataBase = metadataBase
      /**
       * Generate hreflang.
       * e.g. In the home page, the hreflang should be:
       * <head>
       *    ...
       *    <link rel="canonical" href="<URL>?locale=zh"/>
       *    <link rel="alternate" hrefLang="en" href="<URL>?locale=en"/>
       *    ...
       *    <link rel="alternate" hrefLang="x-default" href="<URL>?locale=en"/>
       * </head>
       * */
      metadata.alternates["canonical"] = redirectedPathName(
        locale ?? defaultLocale,
      )
      metadata.alternates["languages"] = {
        ...locales.reduce(
          (acc, locale) => {
            const hreflang: string = locale
            acc[hreflang] = redirectedPathName(locale)
            return acc
          },
          {} as Record<string, string>,
        ),
        "x-default": path,
      }
    }

    return metadata
  }
}
