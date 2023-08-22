import { Metadata } from "next"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import SiteHome from "~/components/site/SiteHome"
import getQueryClient from "~/lib/query-client"
import { PageVisibilityEnum } from "~/lib/types"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export async function generateMetadata({
  params,
}: {
  params: {
    site: string
  }
}): Promise<Metadata> {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const title = `Portfolios - ${site?.metadata?.content?.name || site?.handle}`

  return {
    title,
  }
}

async function SitePortfoliosPage({
  params,
}: {
  params: {
    site: string
  }
}) {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)
  await prefetchGetPagesBySite(
    {
      characterId: site?.characterId,
      type: "portfolio",
      visibility: PageVisibilityEnum.Published,
      useStat: true,
      limit: 18,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <SiteHome handle={params.site} type="portfolio" />
    </Hydrate>
  )
}

export default SitePortfoliosPage
