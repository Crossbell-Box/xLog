import { dehydrate, Hydrate } from "@tanstack/react-query"

import { SiteArchives } from "~/components/site/SiteArchives"
import getQueryClient from "~/lib/query-client"
import { PageVisibilityEnum } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export const generateMetadata = withHrefLang<{
  params: {
    site: string
    tag: string
  }
}>(async ({ params }) => {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  params.tag = decodeURIComponent(params.tag)
  const title = `Tag: ${params.tag} - ${
    site?.metadata?.content?.name || site?.handle
  }`

  return {
    title,
  }
})

export default async function SiteTagPage({
  params,
}: {
  params: {
    site: string
    tag: string
  }
}) {
  params.tag = decodeURIComponent(params.tag)
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)
  await prefetchGetPagesBySite(
    {
      characterId: site?.characterId,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      limit: 100,
      skipExpansion: true,
      tags: [params.tag],
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <SiteArchives />
    </Hydrate>
  )
}
