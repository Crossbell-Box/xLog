import dayjs from "dayjs"
import { NextRequest } from "next/server"

import { QueryClient } from "@tanstack/react-query"

import { getSiteLink } from "~/lib/helpers"
import { NextServerResponse } from "~/lib/server-helper"
import { PageVisibilityEnum } from "~/lib/types"
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
    req.headers.get("x-handle") ||
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
    },
    queryClient,
  )

  const link = getSiteLink({
    subdomain: site?.handle || "",
    domain: site?.metadata?.content?.custom_domain,
  })
  return response.headers({
    "Content-Type": "text/xml",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Origin": "*",
  }).text(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.list?.map((page) => {
    return `  <url>
      <loc>${link}/${page.metadata.content.slug}</loc>
      <lastmod>${dayjs(page.updatedAt).format("YYYY-MM-DD")}</lastmod>
    </url>`
  }).join(`
  `)}
  </urlset>`)
}
