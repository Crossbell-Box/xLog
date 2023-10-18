import { notFound } from "next/navigation"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import PageContent from "~/components/common/PageContent"
import PostCover from "~/components/home/PostCover"
import PostModal from "~/components/home/PostModal"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import { SiteHeader } from "~/components/site/SiteHeader"
import { getTranslation } from "~/lib/i18n"
import { toCid } from "~/lib/ipfs-parser"
import { isOnlyContent } from "~/lib/is-only-content"
import { cn } from "~/lib/utils"
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
  const queryClient = new QueryClient()

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

  const { i18n } = await getTranslation()
  const { t } = await getTranslation("common")
  let summary: string | undefined
  if (!page.metadata.content.disableAISummary) {
    summary = await getSummary({
      cid: toCid(page.metadata?.uri || ""),
      lang: i18n.resolvedLanguage,
    })
  }
  const onlyContent = isOnlyContent()

  const type = page?.metadata?.content?.tags?.[0]
  const images = page.metadata?.content?.attachments
    ?.filter((attachment) => attachment.name === "image")
    .map((img) => img.address || "")
    .filter(Boolean)

  return (
    <PostModal handle={site?.handle}>
      <div className="pb-16">
        <SiteHeader
          handle={params.site}
          hideNavigation={true}
          hideSearch={true}
        />
        <main
          className={cn(
            `xlog-post-id-${page?.characterId}-${page?.noteId}`,
            "xlog-deprecated-class xlog-post-area max-w-screen-md mx-auto px-5 pt-12 relative",
          )}
        >
          <article>
            {type === "short" ? (
              <>
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
                <div>
                  {page?.metadata?.content?.tags?.includes("post") ? (
                    <h2 className="xlog-post-title text-4xl font-bold leading-tight text-center">
                      {page.metadata?.content?.title}
                    </h2>
                  ) : (
                    <h2 className="xlog-post-title text-xl font-bold page-title text-center">
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
                  onlyContent={onlyContent}
                />
              </>
            )}
          </article>
          <HydrationBoundary state={dehydratedState}>
            {page?.metadata && (
              <PostFooter page={page} site={site} fixHeight={true} />
            )}
          </HydrationBoundary>
        </main>
      </div>
    </PostModal>
  )
}
