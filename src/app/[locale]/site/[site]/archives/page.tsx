import { getTranslations } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import PostTitle from "~/components/site/PostTitle"
import { SiteArchives } from "~/components/site/SiteArchives"
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

  const title = `${t("Archives")} - ${site?.metadata?.content?.name || site?.handle}`

  return {
    title,
  }
})

export default async function SiteArchivesPage({
  params,
}: {
  params: {
    site: string
  }
}) {
  const queryClient = getQueryClient()
  const t = await getTranslations()

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
    <>
      <PostTitle title="Archives" />
      <Hydrate state={dehydratedState}>
        <SiteArchives />
      </Hydrate>
    </>
  )
}
