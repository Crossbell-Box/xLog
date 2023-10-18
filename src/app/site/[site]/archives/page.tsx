import { Metadata } from "next"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { SiteArchives } from "~/components/site/SiteArchives"
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
  const queryClient = new QueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const title = `Archives - ${site?.metadata?.content?.name || site?.handle}`

  return {
    title,
  }
}

export default async function SiteArchivesPage({
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
      limit: 100,
      skipExpansion: true,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <SiteArchives />
    </HydrationBoundary>
  )
}
