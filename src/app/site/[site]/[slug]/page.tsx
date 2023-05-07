import { Hydrate, dehydrate } from "@tanstack/react-query"

import { SitePage } from "~/components/site/SitePage"
import { useTranslation } from "~/lib/i18n"
import getQueryClient from "~/lib/query-client"
import { fetchGetPage } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export default async function SitePagePage({
  params,
}: {
  params: {
    site: string
    slug: string
  }
}) {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const page = await fetchGetPage(
    {
      characterId: site?.characterId,
      slug: params.slug,
      useStat: true,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  const { t } = await useTranslation("site")

  return (
    <Hydrate state={dehydratedState}>
      <SitePage page={page || undefined} site={site || undefined} t={t} />
    </Hydrate>
  )
}
