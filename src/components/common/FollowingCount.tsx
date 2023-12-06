"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { CharacterList } from "~/components/common/CharacterList"
import { Button } from "~/components/ui/Button"
import {
  useGetSiteSubscriptions,
  useGetSiteToSubscriptions,
} from "~/queries/site"

export const FollowingCount = ({
  characterId,
  disableList,
}: {
  characterId?: number
  disableList?: boolean
}) => {
  let [isFollowListOpen, setIsFollowListOpen] = useState(false)
  let [isToFollowListOpen, setIsToFollowListOpen] = useState(false)
  const t = useTranslations()

  const subscriptions = useGetSiteSubscriptions({
    characterId,
  })
  const toSubscriptions = useGetSiteToSubscriptions({
    characterId,
  })

  return (
    <>
      <Button
        variant="text"
        className={
          "xlog-site-followers align-middle text-zinc-500 -ml-3" +
          (disableList ? "" : " cursor-pointer")
        }
        onClick={() => setIsFollowListOpen(true)}
      >
        <span className="font-medium text-zinc-700 pr-[3px]">
          {subscriptions.data?.pages?.[0]?.count || 0}
        </span>{" "}
        {t("Followers")}
      </Button>
      <Button
        variant="text"
        className={
          "xlog-site-followings align-middle text-zinc-500 sm:ml-3 !hidden sm:!inline-flex" +
          (disableList ? "" : " cursor-pointer")
        }
        onClick={() => setIsToFollowListOpen(true)}
      >
        <span className="font-medium text-zinc-700 pr-[2px]">
          {toSubscriptions.data?.pages?.[0]?.count || 0}
        </span>{" "}
        {t("Followings")}
      </Button>
      {!disableList && (
        <CharacterList
          open={isFollowListOpen}
          setOpen={setIsFollowListOpen}
          title={t("Followers")}
          loadMore={subscriptions.fetchNextPage}
          hasMore={!!subscriptions.hasNextPage}
          list={subscriptions.data?.pages}
        ></CharacterList>
      )}
      {!disableList && (
        <CharacterList
          open={isToFollowListOpen}
          setOpen={setIsToFollowListOpen}
          title={t("Followings")}
          loadMore={toSubscriptions.fetchNextPage}
          hasMore={!!toSubscriptions.hasNextPage}
          list={toSubscriptions.data?.pages}
        ></CharacterList>
      )}
    </>
  )
}
