"use client"

import PostList from "~/components/site/PostList"
import { PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite, usePinnedPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function SiteHome({ handle }: { handle: string }) {
  const site = useGetSite(handle)
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    useStat: true,
  })
  const pinnedPage = usePinnedPage({ characterId: site.data?.characterId })

  if (!posts.data?.pages?.length) return null

  return (
    <>
      <PostList posts={posts} pinnedNoteId={pinnedPage.noteId} />
    </>
  )
}
