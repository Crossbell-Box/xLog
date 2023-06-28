import { notFound } from "next/navigation"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import PageContent from "~/components/common/PageContent"
import PostModal from "~/components/home/PostModal"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import { useTranslation } from "~/lib/i18n"
import { toCid } from "~/lib/ipfs-parser"
import getQueryClient from "~/lib/query-client"
import { fetchGetPage, getSummary } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export default async function SiteModal({
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

  const { i18n } = await useTranslation()
  const { t } = await useTranslation("common")
  let summary: string | undefined
  if (!page.metadata.content.disableAISummary) {
    summary = await getSummary({
      cid: toCid(page.metadata?.uri || ""),
      lang: i18n.resolvedLanguage,
    })
  }

  return (
    <PostModal>
      <div>
        <article>
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
          <PageContent
            className="mt-10"
            content={page?.metadata?.content?.content}
            toc={false}
            page={page}
            site={site}
            withActions={false}
          />
        </article>
        <Hydrate state={dehydratedState}>
          {page?.metadata && (
            <PostFooter page={page} site={site} fixHeight={true} />
          )}
        </Hydrate>
      </div>
    </PostModal>
  )
}
