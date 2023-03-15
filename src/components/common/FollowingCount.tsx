import { useState } from "react"
import { CharacterList } from "~/components/common/CharacterList"
import {
  useGetSiteSubscriptions,
  useGetSiteToSubscriptions,
} from "~/queries/site"
import { useTranslation } from "next-i18next"
import { Button } from "~/components/ui/Button"

export const FollowingCount: React.FC<{
  siteId?: string
  disableList?: boolean
}> = ({ siteId, disableList }) => {
  let [isFollowListOpen, setIsFollowListOpen] = useState(false)
  let [isToFollowListOpen, setIsToFollowListOpen] = useState(false)
  const { t } = useTranslation("common")

  const subscriptions = useGetSiteSubscriptions({
    siteId: siteId || "",
  })
  const toSubscriptions = useGetSiteToSubscriptions({
    siteId: siteId || "",
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
          {subscriptions.data?.pages?.[0]?.total || 0}
        </span>{" "}
        {t("Followers")}
      </Button>
      <Button
        variant="text"
        className={
          "xlog-site-followings align-middle text-zinc-500 ml-3" +
          (disableList ? "" : " cursor-pointer")
        }
        onClick={() => setIsToFollowListOpen(true)}
      >
        <span className="font-medium text-zinc-700 pr-[2px]">
          {toSubscriptions.data?.pages?.[0]?.total || 0}
        </span>{" "}
        {t("Followings")}
      </Button>
      {!disableList && (
        <CharacterList
          open={isFollowListOpen}
          setOpen={setIsFollowListOpen}
          title="Follow List"
          loadMore={subscriptions.fetchNextPage}
          hasMore={!!subscriptions.hasNextPage}
          list={subscriptions.data?.pages}
        ></CharacterList>
      )}
      {!disableList && (
        <CharacterList
          open={isToFollowListOpen}
          setOpen={setIsToFollowListOpen}
          title="Follow List"
          loadMore={toSubscriptions.fetchNextPage}
          hasMore={!!toSubscriptions.hasNextPage}
          list={toSubscriptions.data?.pages}
        ></CharacterList>
      )}
    </>
  )
}
