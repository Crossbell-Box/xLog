import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { queryClientServer } from "~/lib/query-client.server"
import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
} from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { useGetPagesBySite } from "~/queries/page"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { useGetSiteSubscriptions } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const domainOrSubdomain = ctx.params!.site as string

  await prefetchGetSite(domainOrSubdomain)
  await prefetchGetPagesBySite({
    site: domainOrSubdomain,
    take: 1000,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    render: true,
  })
  await prefetchGetSiteSubscriptions({
    siteId: domainOrSubdomain,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClientServer),
      domainOrSubdomain,
    },
  }
}

function SiteIndexPage({ domainOrSubdomain }: { domainOrSubdomain: string }) {
  const site = useGetSite(domainOrSubdomain)
  const posts = useGetPagesBySite({
    site: domainOrSubdomain,
    take: 1000,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    render: true,
  })
  const subscriptions = useGetSiteSubscriptions({
    siteId: domainOrSubdomain,
  })

  return (
    <SiteLayout site={site.data} subscriptions={subscriptions.data}>
      <SiteHome posts={posts.data} />
    </SiteLayout>
  )
}

export default SiteIndexPage
