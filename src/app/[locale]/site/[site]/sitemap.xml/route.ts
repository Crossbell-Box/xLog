import { NextRequest } from "next/server"

import { QueryClient } from "@tanstack/react-query"

import { locales } from "~/i18n"
import dayjs from "~/lib/dayjs"
import { getSiteLink } from "~/lib/helpers"
import { NextServerResponse } from "~/lib/server-helper"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"
import { fetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export const GET = async (req: NextRequest) => {
  const response = new NextServerResponse()

  const queryClient = new QueryClient()
  // http://localhost:2222/site/innei-4525/sitemap.xml
  // http://innei-4525.localhost:2222/sitemap.xml
  // find innei-5425 site handle by regexp
  const domainOrSubdomain =
    req.nextUrl.pathname.match(/\/site\/(.*)\/sitemap.xml/)?.[1] ||
    req.headers.get("x-xlog-handle") ||
    // http://innei-4525.localhost:2222/sitemap.xml
    req.headers.get("host")?.split(".")[0] ||
    ""

  if (!domainOrSubdomain) {
    return response.status(400).json({
      message: "domainOrSubdomain is not validate",
    })
  }

  const site = await fetchGetSite(domainOrSubdomain, queryClient)

  const pages = await fetchGetPagesBySite(
    {
      characterId: site?.characterId,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      limit: 1000,
      skipExpansion: true,
    },
    queryClient,
  )

  const link = getSiteLink({
    subdomain: site?.handle || "",
    domain: site?.metadata?.content?.custom_domain,
  })

  return response.headers({
    // https://stackoverflow.com/questions/3272534/what-content-type-value-should-i-send-for-my-xml-sitemap
    "Content-Type": "application/xml",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Origin": "*",
  }).text(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/TR/xhtml11/xhtml11_schema.html">
  ${pages.list
    ?.map((page: ExpandedNote) => {
      const location = `${link}/${page.metadata.content.slug}`

      // https://developers.google.com/search/docs/specialty/international/localized-versions#example_2
      const hreflangLinks = locales
        .map((locale) => {
          return `<xhtml:link rel="alternate" hreflang="${locale}" href="${location}?locale=${locale}"/>`
        })
        .join("\n")

      return `  <url>
      <loc>${location}</loc>
      ${hreflangLinks}
      <xhtml:link rel="alternate" hreflang="x-default" href="${location}"/>
      <lastmod>${dayjs(page.updatedAt).format("YYYY-MM-DD")}</lastmod>
    </url>`
    })
    .join("\n")}
  </urlset>`)
}
