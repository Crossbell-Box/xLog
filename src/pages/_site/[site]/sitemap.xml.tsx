import { GetServerSideProps } from "next"
import { fetchGetSite } from "~/queries/site.server"
import { fetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { getSiteLink } from "~/lib/helpers"
import { QueryClient } from "@tanstack/react-query"
import dayjs from "~/lib/date"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  ctx.res.setHeader("Content-Type", "text/xml")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  const domainOrSubdomain = ctx.params!.site as string

  const site = await fetchGetSite(domainOrSubdomain, queryClient)
  const pages = await fetchGetPagesBySite(
    {
      site: domainOrSubdomain,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      take: 1000,
    },
    queryClient,
  )
  console.log(pages)

  const link = getSiteLink({
    subdomain: site.username || "",
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
