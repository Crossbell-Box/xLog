import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { queryClientServer } from "~/lib/query-client.server"
import { fetchGetSite } from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { useGetPagesBySite } from "~/queries/page"
import { fetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { getSiteLink } from "~/lib/helpers"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader("Content-Type", "application/feed+json")
  const domainOrSubdomain = ctx.params!.site as string

  const site = await fetchGetSite(domainOrSubdomain)
  const pages = await fetchGetPagesBySite({
    site: domainOrSubdomain,
    take: 1000,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    render: true,
  })

  const link = getSiteLink({
    subdomain: site.username || "",
  })
  ctx.res.write(
    JSON.stringify({
      version: "https://jsonfeed.org/version/1.1",
      title: site.name,
      description: site.description,
      icon: site.avatars?.[0],
      home_page_url: link,
      feed_url: `${link}/feed.json`,
      items: pages.list?.map((page) => ({
        id: page.id,
        content_html: page.body?.content,
        summary: page.summary?.content,
        url: `${link}/${page.slug || page.id}`,
        image: page.cover,
        date_published: page.date_published,
        date_modified: page.date_updated,
        authors: page.authors?.map((author) => ({
          name: author,
        })),
        tags: page.tags,
      })),
    }),
  )
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
