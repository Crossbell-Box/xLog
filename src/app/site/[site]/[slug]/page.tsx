import { Metadata } from "next"
import { notFound } from "next/navigation"
import serialize from "serialize-javascript"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import PageContent from "~/components/common/PageContent"
import { OIAButton } from "~/components/site/OIAButton"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { getTranslation } from "~/lib/i18n"
import { toCid } from "~/lib/ipfs-parser"
import { isInRN } from "~/lib/is-in-rn"
import getQueryClient from "~/lib/query-client"
import { isOnlyContent } from "~/lib/search-parser"
import { fetchGetPage, getSummary } from "~/queries/page.server"
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
  const useLargeOGImage = !!page?.metadata?.content?.cover
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
      card: useLargeOGImage ? "summary_large_image" : "summary",
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

  const { inRN } = isInRN()

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
  const onlyContent = isOnlyContent()

  function addPageJsonLd() {
    return {
      __html: serialize({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: page?.metadata?.content?.title,
        ...(page?.metadata?.content?.cover && {
          image: [page?.metadata?.content?.cover],
        }),
        datePublished: page?.metadata?.content?.date_published,
        dateModified: page?.updatedAt,
        author: [
          {
            "@type": "Person",
            name: site?.metadata?.content?.name,
            url: getSiteLink({
              subdomain: site?.handle || "",
            }),
          },
        ],
      }),
    }
  }

  const { i18n } = await getTranslation()
  const { t } = await getTranslation("common")
  let summary: string | undefined
  if (!page.metadata.content.disableAISummary) {
    summary = await getSummary({
      cid: toCid(page.metadata?.uri || ""),
      lang: i18n.resolvedLanguage,
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={addPageJsonLd()}
      />
      <article>
        {!onlyContent && (
          <div>
            {page?.metadata?.content?.tags?.includes("post") ? (
              <h2 className="xlog-post-title text-4xl font-bold leading-tight">
                {page.metadata?.content?.title}
              </h2>
            ) : (
              <h2 className="xlog-post-title text-xl font-bold page-title">
                {page?.metadata?.content?.title}
              </h2>
            )}
            {page?.metadata?.content?.tags?.includes("post") && (
              <PostMeta
                page={page}
                site={site}
                summary={summary}
                translated={{
                  "AI-generated summary": t("AI-generated summary"),
                }}
              />
            )}
          </div>
        )}
        <PageContent
          className="mt-10"
          content={page?.metadata?.content?.content}
          toc={true}
          page={page}
          site={site}
          withActions={true}
        />
        <OIAButton
          isInRN={!!inRN}
          link={`/notes/${page?.noteId}/${page?.characterId}`}
        />
      </article>
      {!onlyContent && (
        <Hydrate state={dehydratedState}>
          {page?.metadata && <PostFooter page={page} site={site} />}
        </Hydrate>
      )}
    </>
  )
}
