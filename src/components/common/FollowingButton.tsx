import { useRouter } from "next/router"
import { SITE_URL } from "~/lib/env"
import { Button } from "../ui/Button"
import { Profile } from "~/lib/types"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  useGetSubscription,
  useSubscribeToSite,
  useUnsubscribeFromSite,
  useGetUserSites,
} from "~/queries/site"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import type { Links } from "unidata.js"

export const FollowingButton: React.FC<{
  siteId?: string
}> = ({ siteId }) => {
  const { address } = useAccount()
  const subscribeToSite = useSubscribeToSite()
  const unsubscribeFromSite = useUnsubscribeFromSite()
  const { openConnectModal } = useConnectModal()
  const [followProgress, setFollowProgress] = useState<boolean>(false)
  const userSite = useGetUserSites(address)
  const router = useRouter()

  const handleClickSubscribe = async () => {
    if (!address) {
      setFollowProgress(true)
      openConnectModal?.()
    } else if (!userSite.data) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else if (siteId) {
      if (subscription.data) {
        unsubscribeFromSite.mutate({
          userId: address,
          siteId: siteId,
        })
      } else {
        subscribeToSite.mutate({
          userId: address,
          siteId: siteId,
        })
      }
    }
  }

  const subscription = useGetSubscription({
    userId: address || "",
    siteId: siteId || "",
  })

  useEffect(() => {
    if (
      followProgress &&
      address &&
      subscription.isSuccess &&
      siteId &&
      userSite.isSuccess
    ) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      if (!subscription.data) {
        subscribeToSite.mutate({
          userId: address,
          siteId: siteId,
        })
      }
      setFollowProgress(false)
    }
  }, [
    userSite.isSuccess,
    userSite.data,
    router,
    followProgress,
    address,
    subscription.isSuccess,
    subscription.data,
    siteId,
    subscribeToSite,
  ])

  useEffect(() => {
    if (subscribeToSite.isError || subscribeToSite.data?.code) {
      toast.error(
        "Failed to follow: " +
          (subscribeToSite.data?.message ||
            (subscribeToSite.error as any)?.message),
      )
      subscribeToSite.reset()
    }
  }, [subscribeToSite.isError, subscribeToSite.data?.code, subscribeToSite])

  return (
    <Button
      variant="text"
      onClick={handleClickSubscribe}
      className="space-x-1 group align-middle text-accent mx-5"
      isLoading={
        subscription.data
          ? unsubscribeFromSite.isLoading || subscribeToSite.isLoading
          : userSite.isLoading ||
            unsubscribeFromSite.isLoading ||
            subscribeToSite.isLoading ||
            subscription.isLoading
      }
    >
      <span className="i-bxs:bell"></span>
      {subscription.data ? (
        <>
          <span className="pr-1 group-hover:hidden w-16">Following</span>
          <span className="pr-1 hidden group-hover:block w-16">Unfollow</span>
        </>
      ) : (
        <span className="pr-1">Follow</span>
      )}
    </Button>
  )
}
