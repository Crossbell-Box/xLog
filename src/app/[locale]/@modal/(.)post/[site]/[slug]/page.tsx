import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import MarkdownContentServer from "~/components/common/MarkdownContentServer"
import PostCover from "~/components/home/PostCover"
import PostModal from "~/components/home/PostModal"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import PostTitle from "~/components/site/PostTitle"
import { SiteHeader } from "~/components/site/SiteHeader"
import { toCid } from "~/lib/ipfs-parser"
import { isOnlyContent } from "~/lib/is-only-content"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { cn } from "~/lib/utils"
import { fetchGetPage, getSummary } from "~/queries/page.server"
import { fetchGetSite } from "~/queries/site.server"

export default async function SiteModal({
  params,
}: {
  params: {
    site: string
    slug: string
    locale: Language
  }
}) {
  const queryClient = getQueryClient()

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

  const t = await getTranslations()
  let summary: string | undefined
  if (!page.metadata.content.disableAISummary) {
    summary = await getSummary({
      cid: toCid(page.metadata?.uri || ""),
      lang: params.locale,
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
      <div className="pb-16 overflow-x-hidden overflow-y-scroll">
        <SiteHeader
          handle={params.site}
          hideNavigation={true}
          hideSearch={true}
        />
        <main
          // eslint-disable-next-line tailwindcss/no-custom-classname
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
                </div>
                <MarkdownContentServer
                  className="mt-10"
                  content={page?.metadata?.content?.content}
                  page={page}
                  site={site}
                  withActions={false}
                  onlyContent={onlyContent}
                  codeTheme={site.metadata.content.code_theme}
                />
              </>
            )}
          </article>
          <Hydrate state={dehydratedState}>
            {page?.metadata && (
              <PostFooter page={page} site={site} fixHeight={true} />
            )}
          </Hydrate>
        </main>
      </div>
    </PostModal>
  )
}
