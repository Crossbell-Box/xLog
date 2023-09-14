"use client"

import PostList from "~/components/site/PostList"
import { NoteType, PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite, usePinnedPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function SiteHome({
  handle,
  type,
}: {
  handle: string
  type?: NoteType
}) {
  const site = useGetSite(handle)
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    type: type || ["post", "portfolio"],
    visibility: PageVisibilityEnum.Published,
    useStat: true,
    limit: type === "short" ? 20 : 18,
  })
  const pinnedPage = usePinnedPage({ characterId: site.data?.characterId })

  if (!posts.data?.pages?.length) return null

  return (
    <>
      <PostList
        posts={posts}
        pinnedNoteId={pinnedPage.noteId}
        isShorts={type === "short"}
      />
    </>
  )
}
