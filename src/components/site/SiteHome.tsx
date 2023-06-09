"use client"

import PostList from "~/components/site/PostList"
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
      <PostList posts={posts} />
    </>
  )
}
