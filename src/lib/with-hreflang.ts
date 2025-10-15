import { Metadata, ResolvingMetadata } from "next"
import { headers } from "next/headers"

import { defaultLocale, locales } from "~/i18n"

type BaseProps = {
  params?: Promise<Record<string, any>>
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
      const { locale } = (await props?.params) || {}
      const protocol = (await headers()).get("x-forwarded-proto") || ""
      const host = (await headers()).get("x-forwarded-host") || ""
      const metadataBase = new URL(`${protocol}://${host}`)
      const path = (await headers()).get("x-xlog-pathname") || ""

      const redirectedPathName = async (locale: string) => {
        const search = (await headers()).get("x-xlog-search") || ""
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
      metadata.alternates["canonical"] = await redirectedPathName(
        locale ?? defaultLocale,
      )

      const hrefLangs = await Promise.all(
        locales.map(async (locale) => {
          const hreflang: string = locale
          return {
            hreflang,
            href: await redirectedPathName(locale),
          }
        }),
      )

      metadata.alternates["languages"] = {
        ...locales.reduce(
          (acc, locale) => {
            const hreflang: string = locale
            acc[hreflang] = hrefLangs.find(
              (hl) => hl.hreflang === hreflang,
            )?.href!
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
