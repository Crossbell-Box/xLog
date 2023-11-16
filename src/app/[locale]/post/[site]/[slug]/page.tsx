import { redirect } from "next/navigation"
import { NextServerPageBaseParams } from "types/next"

import { getSiteLink } from "~/lib/helpers"
import { withLocale } from "~/lib/i18n/with-locale"
import getQueryClient from "~/lib/query-client"
import { fetchGetPage } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export default async function PostPage({
  params,
}: NextServerPageBaseParams<{
  site: string
  slug: string
}>) {
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

  const originalLng = page?.metadata.content.originalLanguage

  const url = new URL(
    `${getSiteLink({
      subdomain: params.site,
    })}${withLocale(`/${params.slug}`, {
      pathLocale: params.locale,
      defaultLocale: originalLng,
    })}`,
  )

  redirect(url.toString())
}
