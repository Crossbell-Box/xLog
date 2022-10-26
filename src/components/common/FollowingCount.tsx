import { Profile } from "~/lib/types"
import { useEffect, useState } from "react"
import type { Link } from "unidata.js"
import { getSiteSubscriptions } from "~/models/site.model"
import type { Links } from "unidata.js"
import { CharacterList } from "~/components/common/CharacterList"
import { useGetSiteSubscriptions } from "~/queries/site"

export const FollowingCount: React.FC<{
  siteId?: string
  disableList?: boolean
}> = ({ siteId, disableList }) => {
  let [isFollowListOpen, setIsFollowListOpen] = useState(false)

  const subscriptions = useGetSiteSubscriptions({
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

  return (
    <>
      {subscriptions ? (
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
      ) : (
        ""
      )}
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
    </>
  )
}
