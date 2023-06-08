"use client"

import SitePostList from "~/components/site/SitePostList"
import { PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function SiteHome({ handle }: { handle: string }) {
  const site = useGetSite(handle)
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    useStat: true,
  })

  if (!posts.data?.pages?.length) return null

  return (
    <>
      <SitePostList posts={posts} />
    </>
  )
}
