import { getTranslations } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import PostTitle from "~/components/site/PostTitle"
import SiteTag from "~/components/site/SiteTag"
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
  const t = await getTranslations()

  params.tag = decodeURIComponent(params.tag)
  const title = `${t("Tag")}: ${params.tag} - ${
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
      limit: 18,
      tags: [params.tag],
      sortType: "latest",
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <>
      <PostTitle
        title={params.tag}
        icon={<i className="i-mingcute-tag-line mr-[2px]" />}
      />
      <Hydrate state={dehydratedState}>
        <SiteTag handle={params.site} tag={params.tag} />
      </Hydrate>
    </>
  )
}
