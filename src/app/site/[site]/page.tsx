import { Hydrate, dehydrate } from "@tanstack/react-query"

import SiteHome from "~/components/site/SiteHome"
import getQueryClient from "~/lib/query-client"
import { PageVisibilityEnum } from "~/lib/types"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

async function SiteIndexPage({
  params,
}: {
  params: {
    site: string
  }
}) {
  const queryClient = getQueryClient()

  console.time("1fetchGetSite")
  const site = await fetchGetSite(params.site, queryClient)
  console.timeEnd("1fetchGetSite")
  console.time("1prefetchGetPagesBySite")
  await prefetchGetPagesBySite(
    {
      characterId: site?.characterId,
      type: ["post", "portfolio"],
      visibility: PageVisibilityEnum.Published,
      useStat: true,
      limit: 18,
    },
    queryClient,
  )
  console.timeEnd("1prefetchGetPagesBySite")

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <SiteHome handle={params.site} />
    </Hydrate>
  )
}

export default SiteIndexPage
