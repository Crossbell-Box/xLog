import { Profile } from "~/lib/types"
import { useEffect, useState } from "react"
import type { Link } from "unidata.js"
import {
  getSiteSubscriptions,
  getSiteToSubscriptions,
} from "~/models/site.model"
import { CharacterList } from "~/components/common/CharacterList"
import {
  useGetSiteSubscriptions,
  useGetSiteToSubscriptions,
} from "~/queries/site"

export const FollowingCount: React.FC<{
  siteId?: string
  disableList?: boolean
}> = ({ siteId, disableList }) => {
  let [isFollowListOpen, setIsFollowListOpen] = useState(false)
  let [isToFollowListOpen, setIsToFollowListOpen] = useState(false)

  const subscriptions = useGetSiteSubscriptions({
    siteId: siteId || "",
  })
  const toSubscriptions = useGetSiteToSubscriptions({
    siteId: siteId || "",
  })

  const [siteSubscriptionList, setSiteSubscriptionList] = useState<Link[]>([])
  const [cursor, setCursor] = useState<string>()
  useEffect(() => {
    if (
      subscriptions.isSuccess &&
      subscriptions.data?.list &&
      !siteSubscriptionList.length
    ) {
      setSiteSubscriptionList(subscriptions.data.list || [])
      setCursor(subscriptions.data.cursor)
    }
  }, [
    subscriptions.isSuccess,
    subscriptions.data?.list,
    subscriptions.data?.cursor,
    siteSubscriptionList.length,
  ])

  const [siteToSubscriptionList, setSiteToSubscriptionList] = useState<Link[]>(
    [],
  )
  const [toCursor, setToCursor] = useState<string>()
  useEffect(() => {
    if (
      toSubscriptions.isSuccess &&
      toSubscriptions.data?.list &&
      !siteToSubscriptionList.length
    ) {
      setSiteToSubscriptionList(toSubscriptions.data.list || [])
      setToCursor(toSubscriptions.data.cursor)
    }
  }, [
    toSubscriptions.isSuccess,
    toSubscriptions.data?.list,
    toSubscriptions.data?.cursor,
    siteToSubscriptionList.length,
  ])

  const loadMoreSubscriptions = async () => {
    if (cursor) {
      const subs = await getSiteSubscriptions({
        siteId: siteId || "",
        cursor,
      })
      setSiteSubscriptionList((prev) => [...prev, ...(subs?.list || [])])
      setCursor(subs?.cursor)
    }
  }

  const loadMoreToSubscriptions = async () => {
    if (cursor) {
      const subs = await getSiteToSubscriptions({
        siteId: siteId || "",
        cursor: toCursor,
      })
      setSiteToSubscriptionList((prev) => [...prev, ...(subs?.list || [])])
      setToCursor(subs?.cursor)
    }
  }

  return (
    <>
      <span
        className={
          "xlog-site-followers align-middle text-zinc-500 text-sm" +
          (disableList ? "" : " cursor-pointer")
        }
        onClick={() => setIsFollowListOpen(true)}
      >
        <span className="font-bold text-zinc-700">
          {subscriptions.data?.total || 0}
        </span>{" "}
        Followers
      </span>
      <span
        className={
          "xlog-site-followings align-middle text-zinc-500 text-sm ml-5" +
          (disableList ? "" : " cursor-pointer")
        }
        onClick={() => setIsToFollowListOpen(true)}
      >
        <span className="font-bold text-zinc-700">
          {toSubscriptions.data?.total || 0}
        </span>{" "}
        Followings
      </span>
      {!disableList && (
        <CharacterList
          open={isFollowListOpen}
          setOpen={setIsFollowListOpen}
          title="Follow List"
          loadMore={loadMoreSubscriptions}
          hasMore={!!cursor}
          list={siteSubscriptionList}
        ></CharacterList>
      )}
      {!disableList && (
        <CharacterList
          open={isToFollowListOpen}
          setOpen={setIsToFollowListOpen}
          title="Follow List"
          loadMore={loadMoreToSubscriptions}
          hasMore={!!toCursor}
          list={siteToSubscriptionList}
        ></CharacterList>
      )}
    </>
  )
}
