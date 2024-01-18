"use client"

import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"

import PostTitle from "~/components/site/PostTitle.client"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

const DynamicMarkdownContent = dynamic(
  () => import("~/components/common/MarkdownContent"),
  {
    ssr: false,
  },
)

export default function SitePreviewPage() {
  const params = useParams()
  const site = useGetSite(params.site as string)

  const page = useGetPage({
    characterId: site.data?.characterId,
    noteId:
      params.previewId && /\d+/.test(params.previewId as string)
        ? +params.previewId
        : undefined,
    slug: params.previewId as string,
    useStat: true,
  })

  const t = useTranslations()

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="fixed top-0 left-0 w-full text-center text-red-500 bg-gray-100 py-2 opacity-80 text-sm z-10">
        {t(
          "This address is in local editing preview mode and cannot be viewed by the public",
        )}
      </div>
      <article>
        <div>
          <PostTitle
            title={page.data?.metadata?.content?.title}
            skipTranslate={true}
            center={true}
          />
        </div>
        <DynamicMarkdownContent
          className="mt-10"
          content={page.data?.metadata?.content?.content}
          withToc={true}
        ></DynamicMarkdownContent>
      </article>
    </div>
  )
}
