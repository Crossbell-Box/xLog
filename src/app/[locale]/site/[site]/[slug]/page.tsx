import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import serialize from "serialize-javascript"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import MarkdownContentServer from "~/components/common/MarkdownContentServer"
import PostCover from "~/components/home/PostCover"
import { OIAButton } from "~/components/site/OIAButton"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import PostTitle from "~/components/site/PostTitle"
import TranslationInfo from "~/components/site/TranslationInfo"
import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { toCid, toGateway } from "~/lib/ipfs-parser"
import { isInRN } from "~/lib/is-in-rn"
import { isOnlyContent } from "~/lib/is-only-content"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { fetchGetPage, getSummary } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export const generateMetadata = withHrefLang<{
  params: {
    site: string
    slug: string
  }
}>(async ({ params }) => {
  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  const site = await fetchGetSite(params.site, queryClient)

  const page = await fetchGetPage(
    {
      characterId: site?.characterId,
      slug: params.slug,
      useStat: true,
      translateTo: locale,
    },
    queryClient,
  )

  const title = `${
    page?.metadata?.content?.title ||
    page?.metadata?.content?.content ||
    "No titile"
  } - ${site?.metadata?.content?.name || site?.handle}`

  const description = page?.metadata?.content?.summary

  const siteImages =
    site?.metadata?.content?.avatars?.[0] || `${SITE_URL}/assets/logo.svg`
  const images = page?.metadata?.content?.images
    ? page?.metadata?.content?.images.map((image) => toGateway(image))
    : [siteImages]
  const useLargeOGImage = !!page?.metadata?.content?.cover
  const twitterCreator = site?.metadata?.content?.connected_accounts
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
      images: images.reverse(),
      site: "@_xLog",
      creator: twitterCreator ? `@${twitterCreator}` : undefined,
    },
  }
})

export default async function SitePagePage({
  params,
}: {
  params: {
    site: string
    slug: string
    locale: Language
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
      translateTo: params.locale,
    },
    queryClient,
  )

  if (
    !site ||
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

  const t = await getTranslations()
  let summary: string | undefined
  if (!page.metadata.content.disableAISummary) {
    summary = await getSummary({
      cid: toCid(page.metadata?.uri || ""),
      lang: params.locale,
    })
  }

  const type = page?.metadata?.content?.tags?.[0]
  const images = page.metadata?.content?.attachments
    ?.filter((attachment) => attachment.name === "image")
    .map((img) => img.address || "")
    .filter(Boolean)

  return (
    <div className="max-w-screen-md mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={addPageJsonLd()}
      />
      <article>
        {type === "short" ? (
          <>
            <TranslationInfo page={page} className="mb-4 mt-2" />
            <PostCover
              uniqueKey={`short-${page.characterId}-${page.noteId}`}
              images={images}
              title={page.metadata?.content?.title}
              className="rounded-lg w-full aspect-auto mb-4 border-b-0"
            />
            {page?.metadata?.content?.title && (
              <h2 className="xlog-short-title font-bold mb-2 text-lg">
                {page?.metadata?.content?.title}
              </h2>
            )}
            <div className="xlog-short-content prose">
              {page?.metadata?.content?.content}
            </div>
          </>
        ) : (
          <>
            {!onlyContent && (
              <>
                <PostTitle
                  title={page?.metadata?.content?.title}
                  skipTranslate={true}
                  center={true}
                />
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
              </>
            )}
            <MarkdownContentServer
              className="mt-10"
              content={page?.metadata?.content?.content}
              withToc={true}
              page={page}
              site={site}
              withActions={true}
              onlyContent={onlyContent}
              codeTheme={site.metadata.content.code_theme}
            />
          </>
        )}

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
    </div>
  )
}
