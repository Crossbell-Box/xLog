"use client"

import { useState } from "react"

import PostList from "~/components/site/PostList"
import { Tabs, type TabItem } from "~/components/ui/Tabs"
import { NoteType, PagesSortTypes, PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite, usePinnedPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { Loading } from "../common/Loading"

export default function SiteHome({
  handle,
  type,
}: {
  handle: string
  type?: NoteType
}) {
  const site = useGetSite(handle)
  const [sortType, setSortType] = useState<PagesSortTypes>("latest")
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    type: type || ["post", "portfolio"],
    visibility: PageVisibilityEnum.Published,
    useStat: true,
    limit: type === "short" ? 20 : 18,
    sortType: sortType,
  })
  const pinnedPage = usePinnedPage({ characterId: site.data?.characterId })

  let tabs: TabItem[]
  switch (type) {
    case "portfolio":
      tabs = []
      break
    case "short":
      tabs = [
        {
          text: "Latest",
          onClick: () => setSortType("latest"),
          active: sortType === "latest",
        },
        {
          text: "Most Commented",
          onClick: () => setSortType("commented"),
          active: sortType === "commented",
        },
      ]
      break
    default:
      tabs = [
        {
          text: "Latest",
          onClick: () => setSortType("latest"),
          active: sortType === "latest",
        },
        {
          text: "Hottest",
          onClick: () => setSortType("hottest"),
          active: sortType === "hottest",
        },
        {
          text: "Most Commented",
          onClick: () => setSortType("commented"),
          active: sortType === "commented",
        },
      ]
      break
  }

  return (
    <>
      <Tabs items={tabs} className="mb-6" type="rounded" />
      {!posts.data?.pages?.length && posts.isLoading && <Loading />}
      <PostList
        posts={posts}
        pinnedNoteId={pinnedPage.noteId}
        isShorts={type === "short"}
      />
    </>
  )
}
