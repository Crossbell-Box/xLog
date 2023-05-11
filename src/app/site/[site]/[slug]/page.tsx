import { Metadata } from "next"
import { notFound } from "next/navigation"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { SitePage } from "~/components/site/SitePage"
import { SITE_URL } from "~/lib/env"
import { useTranslation } from "~/lib/i18n"
import getQueryClient from "~/lib/query-client"
import { fetchGetPage } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export async function generateMetadata({
  params,
}: {
  params: {
    site: string
    slug: string
  }
}): Promise<Metadata> {
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

  const title = `${page?.metadata?.content?.title} - ${
    site?.metadata?.content?.name || site?.handle
  }`
  const description = page?.metadata?.content?.summary
  const siteImages =
    site?.metadata?.content?.avatars || `${SITE_URL}/assets/logo.svg`
  const images = page?.metadata?.content?.cover || siteImages
  const twitterCreator =
    "@" +
    site?.metadata?.content?.connected_accounts
      ?.find((account) => account?.endsWith?.("@twitter"))
      ?.match(/csb:\/\/account:([^@]+)@twitter/)?.[1]

  return {
    title,
    description,
    openGraph: {
      siteName: title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
      site: "@_xLog",
      creator: twitterCreator,
    },
  }
}

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

  if (
    !page ||
    new Date(page!.metadata?.content?.date_published || "") > new Date()
  ) {
    notFound()
  }

  const dehydratedState = dehydrate(queryClient)

  const { t } = await useTranslation("site")

  return (
    <Hydrate state={dehydratedState}>
      <SitePage page={page || undefined} site={site || undefined} />
    </Hydrate>
  )
}
