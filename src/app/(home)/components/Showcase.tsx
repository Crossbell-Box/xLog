"use client"

import { FollowAllButton } from "~/components/common/FollowAllButton"
import { useGetShowcase } from "~/queries/home"

import ShowcaseList from "./ShowcaseList"

export function ShowCase() {
  const showcaseSites = useGetShowcase()
  return (
    <>
      <FollowAllButton
        className="mt-5"
        size="xl"
        characterIds={showcaseSites.data
          ?.map((s: { characterId?: string }) => s.characterId)
          .filter(Boolean)
          .map(Number)}
        siteIds={showcaseSites.data?.map((s: { handle: string }) => s.handle)}
      />
      <ShowcaseList sites={showcaseSites.data} />
    </>
  )
}
