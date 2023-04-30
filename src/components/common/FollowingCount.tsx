import { useTranslation } from "next-i18next"
import { useState } from "react"

import { CharacterList } from "~/components/common/CharacterList"
import { Button } from "~/components/ui/Button"
import {
  useGetSiteSubscriptions,
  useGetSiteToSubscriptions,
} from "~/queries/site"

export const FollowingCount: React.FC<{
  characterId?: number
  disableList?: boolean
}> = ({ characterId, disableList }) => {
  let [isFollowListOpen, setIsFollowListOpen] = useState(false)
  let [isToFollowListOpen, setIsToFollowListOpen] = useState(false)
  const { t } = useTranslation("common")

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
          "xlog-site-followers align-middle text-zinc-500 -ml-2" +
          (disableList ? "" : " cursor-pointer")
        }
        onClick={() => setIsFollowListOpen(true)}
      >
        <span className="font-medium text-zinc-700 pr-[2px]">
          {subscriptions.data?.pages?.[0]?.count || 0}
        </span>{" "}
        {t("Followers")}
      </Button>
      <Button
        variant="text"
        className={
          "xlog-site-followings align-middle text-zinc-500 sm:ml-3" +
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
