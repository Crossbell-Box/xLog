import { notFound } from "next/navigation"
import serialize from "serialize-javascript"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { PageContent } from "~/components/common/PageContent"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n"
import getQueryClient from "~/lib/query-client"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { fetchGetPage } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export async function SitePage({
  params,
}: {
  params?: {
    site: string
    slug: string
  }
}) {
  const { t } = await useTranslation("site")

  const queryClient = getQueryClient()

  let site: ExpandedCharacter | undefined | null
  let page: ExpandedNote | undefined | null
  if (params) {
    site = await fetchGetSite(params.site, queryClient)
    page = await fetchGetPage(
      {
        characterId: site?.characterId,
        slug: params.slug,
        useStat: true,
      },
      queryClient,
    )
  } else {
    page = {
      metadata: {
        content: {
          title: t("404 - Whoops, this page is gone."),
          content: `
- [Back to Home](/)
- [All posts](/archives)

![image](${SITE_URL}/assets/404.svg)`,
        },
      },
    } as ExpandedNote
  }

  if (
    !page ||
    new Date(page!.metadata?.content?.date_published || "") > new Date()
  ) {
    notFound()
  }

  const dehydratedState = dehydrate(queryClient)

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={addPageJsonLd()}
      />
      <article>
        <div>
          {page?.metadata?.content?.tags?.includes("post") ? (
            <h2 className="xlog-post-title text-4xl font-bold">
              {page.metadata?.content?.title}
            </h2>
          ) : (
            <h2 className="xlog-post-title text-xl font-bold page-title">
              {page?.metadata?.content?.title}
            </h2>
          )}
          {page?.metadata?.content?.tags?.includes("post") && (
            /* @ts-expect-error Async Server Component */
            <PostMeta page={page} site={site} />
          )}
        </div>
        <PageContent
          className="mt-10"
          content={page?.metadata?.content?.content}
          toc={true}
        ></PageContent>
      </article>
      {page?.metadata && (
        <Hydrate state={dehydratedState}>
          <PostFooter page={page} site={site || undefined} />
        </Hydrate>
      )}
    </>
  )
}
