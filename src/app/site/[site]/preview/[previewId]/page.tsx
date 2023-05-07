"use client"

import { SitePage } from "~/components/site/SitePage"
import { useTranslation } from "~/lib/i18n/client"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function SitePreviewPage({
  params,
}: {
  params: {
    site: string
    previewId: string
  }
}) {
  const site = useGetSite(params.site)

  const page = useGetPage({
    characterId: site.data?.characterId,
    slug: params.previewId,
    useStat: true,
  })

  const { t } = useTranslation("site")

  return (
    <SitePage
      page={page.data || undefined}
      site={site.data || undefined}
      t={t}
    />
  )
}
