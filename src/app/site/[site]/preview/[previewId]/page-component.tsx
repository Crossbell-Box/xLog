"use client"

import dynamic from "next/dynamic"
import { useParams } from "next/navigation"

import { useTranslation } from "~/lib/i18n/client"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

const DynamicPageContent = dynamic(
  () => import("~/components/common/PageContent"),
  {
    ssr: false,
  },
)

export default function SitePreviewPage() {
  const params = useParams()
  const site = useGetSite(params.site)

  const page = useGetPage({
    characterId: site.data?.characterId,
    noteId:
      params.previewId && /\d+/.test(params.previewId)
        ? +params.previewId
        : undefined,
    slug: params.previewId,
    useStat: true,
  })

  const { t } = useTranslation("site")

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="fixed top-0 left-0 w-full text-center text-red-500 bg-gray-100 py-2 opacity-80 text-sm z-10">
        {t(
          "This address is in local editing preview mode and cannot be viewed by the public.",
        )}
      </div>
      <article>
        <div>
          {page.data?.metadata?.content?.tags?.includes("post") ? (
            <h2 className="xlog-post-title text-4xl font-bold leading-tight">
              {page.data.metadata?.content?.title}
            </h2>
          ) : (
            <h2 className="xlog-post-title text-xl font-bold page-title">
              {page.data?.metadata?.content?.title}
            </h2>
          )}
        </div>
        <DynamicPageContent
          className="mt-10"
          content={page.data?.metadata?.content?.content}
          toc={true}
        ></DynamicPageContent>
      </article>
    </div>
  )
}
