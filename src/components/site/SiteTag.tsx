"use client"

import { useState } from "react"

import PostList from "~/components/site/PostList"
import { Tabs, type TabItem } from "~/components/ui/Tabs"
import { PagesSortTypes, PageVisibilityEnum } from "~/lib/types"
import { useGetPagesBySiteLite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { Loading } from "../common/Loading"

export default function SiteTag({
  handle,
  tag,
}: {
  handle: string
  tag: string
}) {
  const site = useGetSite(handle)
  const [sortType, setSortType] = useState<PagesSortTypes>("latest")
  const posts = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    limit: 18,
    tags: [tag],
    sortType: sortType,
  })

  let tabs: TabItem[] = [
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

  return (
    <>
      <Tabs items={tabs} className="mb-6" type="rounded" />
      {!posts.data?.pages?.length && posts.isLoading && <Loading />}
      <PostList posts={posts} />
    </>
  )
}
