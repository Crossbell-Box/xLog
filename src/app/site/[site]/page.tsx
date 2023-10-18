import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import ShortPreviewList from "~/components/site/ShortPreviewList"
import SiteHome from "~/components/site/SiteHome"
import { PageVisibilityEnum } from "~/lib/types"
import {
  fetchGetPagesBySite,
  prefetchGetPagesBySite,
} from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

async function SiteIndexPage({
  params,
}: {
  params: {
    site: string
  }
}) {
  const queryClient = new QueryClient()

  const site = await fetchGetSite(params.site, queryClient)
  await prefetchGetPagesBySite(
    {
      characterId: site?.characterId,
      type: ["post", "portfolio"],
      visibility: PageVisibilityEnum.Published,
      useStat: true,
      limit: 18,
      sortType: "latest",
    },
    queryClient,
  )
  const shorts = await fetchGetPagesBySite(
    {
      characterId: site?.characterId,
      type: "short",
      visibility: PageVisibilityEnum.Published,
      useStat: true,
      limit: 8,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <>
      {!!shorts?.count && <ShortPreviewList shorts={shorts} />}
      <HydrationBoundary state={dehydratedState}>
        <SiteHome handle={params.site} />
      </HydrationBoundary>
    </>
  )
}

export default SiteIndexPage
