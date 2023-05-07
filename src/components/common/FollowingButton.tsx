import { useEffect } from "react"
import { toast } from "react-hot-toast"

import { Button } from "~/components/ui/Button"
import type { Variant } from "~/components/ui/Button"
import { UniLink } from "~/components/ui/UniLink"
import { SITE_URL } from "~/lib/env"
import { Trans, useTranslation } from "~/lib/i18n/client"
import { ExpandedCharacter } from "~/lib/types"
import { cn } from "~/lib/utils"
import {
  useGetSubscription,
  useSubscribeToSite,
  useUnsubscribeFromSite,
} from "~/queries/site"

export const FollowingButton: React.FC<{
  site?: ExpandedCharacter
  variant?: Variant
  className?: string
  size?: "sm" | "xl"
  loadingStatusChange?: (status: boolean) => void
}> = ({ site, variant, className, size, loadingStatusChange }) => {
  const subscribeToSite = useSubscribeToSite()
  const unsubscribeFromSite = useUnsubscribeFromSite()
  const { t } = useTranslation("common")

  const handleClickSubscribe = () => {
    if (site?.characterId) {
      if (subscription.data) {
        unsubscribeFromSite.mutate({
          characterId: site?.characterId,
          siteId: site?.handle,
        } as any)
      } else {
        subscribeToSite.mutate({
          characterId: site?.characterId,
          siteId: site?.handle,
        } as any)
      }
    }
  }

  const subscription = useGetSubscription(site?.characterId)

  useEffect(() => {
    if (subscribeToSite.isError) {
      subscribeToSite.reset()
    }
  }, [subscribeToSite])

  useEffect(() => {
    if (subscribeToSite.isSuccess) {
      subscribeToSite.reset()
      toast.success(
        <span>
          <Trans i18nKey="Successfully followed" ns="common">
            Hey there! You&apos;re all set to{" "}
            <UniLink className="underline" href={`${SITE_URL}/activities`}>
              keep up with your followed blogger&apos;s latest buzz here
            </UniLink>
            .
          </Trans>
        </span>,
        {
          duration: 5000,
        },
      )
    }
  }, [subscribeToSite, t])

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
      variant={subscription.data ? "text" : variant}
      onClick={handleClickSubscribe}
      className={cn(
        className,
        "align-middle group border-accent border text-sm sm:text-base",
        {
          "text-accent": subscription.data,
          "opacity-60": subscription.data,
        },
      )}
      isLoading={
        subscription.data
          ? unsubscribeFromSite.isLoading || subscribeToSite.isLoading
          : unsubscribeFromSite.isLoading ||
            subscribeToSite.isLoading ||
            subscription.isLoading
      }
      size={size}
      aria-label="follow"
      isAutoWidth
    >
      {subscription.data ? (
        <>
          <span className="group-hover:hidden inline-flex items-center">
            <span className="icon-[mingcute--user-follow-fill] inline-block sm:mr-2"></span>{" "}
            <span className="hidden sm:inline">{t("Following")}</span>
          </span>
          <span className="hidden group-hover:inline-flex items-center">
            <span className="icon-[mingcute--user-remove-fill] inline-block sm:mr-2"></span>{" "}
            <span className="hidden sm:inline">{t("Unfollow")}</span>
          </span>
        </>
      ) : (
        <span className="inline-flex items-center">
          <span className="icon-[mingcute--user-add-fill] inline-block sm:mr-2"></span>{" "}
          <span className="hidden sm:inline">{t("Follow")}</span>
        </span>
      )}
    </Button>
  )
}
