import { useRouter } from "next/router"
import { SITE_URL } from "~/lib/env"
import { Button } from "~/components/ui/Button"
import type { Variant } from "~/components/ui/Button"
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
import clsx from "clsx"

export const FollowingButton: React.FC<{
  siteId?: string
  variant?: Variant
  className?: string
  size?: "sm" | "xl"
  loadingStatusChange?: (status: boolean) => void
}> = ({ siteId, variant, className, size, loadingStatusChange }) => {
  const { address } = useAccount()
  const subscribeToSite = useSubscribeToSite()
  const unsubscribeFromSite = useUnsubscribeFromSite()
  const { openConnectModal } = useConnectModal()
  const [followProgress, setFollowProgress] = useState<boolean>(false)
  const userSite = useGetUserSites(address)
  const router = useRouter()

  const handleClickSubscribe = async (e: any) => {
    e.preventDefault()
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

  useEffect(() => {
    if (unsubscribeFromSite.isLoading || subscribeToSite.isLoading) {
      loadingStatusChange?.(true)
    } else {
      loadingStatusChange?.(false)
    }
  }, [
    unsubscribeFromSite.isLoading,
    subscribeToSite.isLoading,
    loadingStatusChange,
  ])

  return (
    <Button
      variant={variant}
      onClick={handleClickSubscribe}
      className={clsx(className, "align-middle space-x-1")}
      isLoading={
        subscription.data
          ? unsubscribeFromSite.isLoading || subscribeToSite.isLoading
          : userSite.isLoading ||
            unsubscribeFromSite.isLoading ||
            subscribeToSite.isLoading ||
            subscription.isLoading
      }
      size={size}
      aria-label="follow"
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
