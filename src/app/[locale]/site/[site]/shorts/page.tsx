import { getTranslations } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import PostTitle from "~/components/site/PostTitle"
import SiteHome from "~/components/site/SiteHome"
import getQueryClient from "~/lib/query-client"
import { PageVisibilityEnum } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export const generateMetadata = withHrefLang<{
  params: {
    site: string
  }
}>(async ({ params }) => {
  const queryClient = getQueryClient()
  const t = await getTranslations()

  const site = await fetchGetSite(params.site, queryClient)

  const title = `${t("Shorts")} - ${site?.metadata?.content?.name || site?.handle}`

  return {
    title,
  }
})

async function SiteShortsPage({
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
      type: "short",
      visibility: PageVisibilityEnum.Published,
      useStat: true,
      limit: 20,
      sortType: "latest",
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <>
      <PostTitle title="Shorts" />
      <Hydrate state={dehydratedState}>
        <SiteHome handle={params.site} type="short" />
      </Hydrate>
    </>
  )
}

export default SiteShortsPage
