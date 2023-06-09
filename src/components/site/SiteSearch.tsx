"use client"

import { useParams, useSearchParams } from "next/navigation"

import PostList from "~/components/site/PostList"
import { useTranslation } from "~/lib/i18n/client"
import { useGetSearchPagesBySite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export const SiteSearch = () => {
  const { t } = useTranslation("site")

  const searchParams = useSearchParams()
  const params = useParams()
  const site = useGetSite(params?.site as string)
  const keyword = searchParams?.get("q") || undefined
  const posts = useGetSearchPagesBySite({
    characterId: site.data?.characterId,
    keyword,
  })

  return (
    <>
      <h2 className="mb-8 mt-5 text-zinc-500">
        {posts.data?.pages?.[0].count || "0"} {t("results")}
      </h2>
      {posts.isLoading && <>{t("Loading")}...</>}
      <PostList posts={posts} keyword={keyword} />
    </>
  )
}
