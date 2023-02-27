import { Button } from "~/components/ui/Button"
import type { Variant } from "~/components/ui/Button"
import { useEffect } from "react"
import {
  useGetSubscription,
  useSubscribeToSite,
  useUnsubscribeFromSite,
  useAccountSites,
} from "~/queries/site"
import { useConnectedAction } from "@crossbell/connect-kit"
import { cn } from "~/lib/utils"
import { Profile } from "~/lib/types"
import { useTranslation } from "next-i18next"

export const FollowingButton: React.FC<{
  site: Profile | undefined | null
  variant?: Variant
  className?: string
  size?: "sm" | "xl"
  loadingStatusChange?: (status: boolean) => void
}> = ({ site, variant, className, size, loadingStatusChange }) => {
  const subscribeToSite = useSubscribeToSite()
  const unsubscribeFromSite = useUnsubscribeFromSite()
  const userSite = useAccountSites()
  const characterId = site?.metadata?.proof ? Number(site.metadata.proof) : null
  const { t } = useTranslation("common")

  const handleClickSubscribe = useConnectedAction(() => {
    if (characterId) {
      if (subscription.data) {
        unsubscribeFromSite.mutate({
          characterId,
          siteId: site?.username,
        } as any)
      } else {
        subscribeToSite.mutate({
          characterId,
          siteId: site?.username,
        } as any)
      }
    }
  })

  const subscription = useGetSubscription(site?.username)

  useEffect(() => {
    if (subscribeToSite.isError) {
      subscribeToSite.reset()
    }
  }, [subscribeToSite])

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
      className={cn(className, "align-middle space-x-1 group")}
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
          <span className="pr-1 group-hover:hidden w-16">{t("Following")}</span>
          <span className="pr-1 hidden group-hover:block w-16">
            {t("Unfollow")}
          </span>
        </>
      ) : (
        <span className="pr-1">{t("Follow")}</span>
      )}
    </Button>
  )
}
