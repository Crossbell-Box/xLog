import dayjs from "dayjs"
import { GetServerSideProps } from "next"

import { QueryClient } from "@tanstack/react-query"

import { getSiteLink } from "~/lib/helpers"
import { PageVisibilityEnum } from "~/lib/types"
import { fetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  ctx.res.setHeader("Content-Type", "text/xml")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  const domainOrSubdomain = ctx.params!.site as string

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
    domain: site?.metadata?.content?.custom_domain,
    subdomain: site?.handle || "",
  })
  ctx.res.write(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.list?.map(
  (page: any) => `  <url>
    <loc>${link}/${page.slug || page.id}</loc>
    <lastmod>${dayjs(page.date_updated).format("YYYY-MM-DD")}</lastmod>
  </url>`,
).join(`
`)}
</urlset>`)
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
