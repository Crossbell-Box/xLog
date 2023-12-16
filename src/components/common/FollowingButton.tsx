"use client"

import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "react-hot-toast"

import { Button } from "~/components/ui/Button"
import type { Variant } from "~/components/ui/Button"
import { UniLink } from "~/components/ui/UniLink"
import { SITE_URL } from "~/lib/env"
import { ExpandedCharacter } from "~/lib/types"
import { cn } from "~/lib/utils"
import {
  useGetSubscription,
  useSubscribeToSite,
  useUnsubscribeFromSite,
} from "~/queries/site"

export const FollowingButton = ({
  site,
  variant,
  className,
  size,
  loadingStatusChange,
}: {
  site?: ExpandedCharacter
  variant?: Variant
  className?: string
  size?: "sm" | "xl"
  loadingStatusChange?: (status: boolean) => void
}) => {
  const subscribeToSite = useSubscribeToSite()
  const unsubscribeFromSite = useUnsubscribeFromSite()
  const t = useTranslations()

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
          {t.rich("Successfully followed", {
            link: (chunks) => (
              <UniLink className="underline" href={`${SITE_URL}/`}>
                {chunks}
              </UniLink>
            ),
          })}
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

  const isLoading = subscription.data
    ? unsubscribeFromSite.isLoading || subscribeToSite.isLoading
    : unsubscribeFromSite.isLoading ||
      subscribeToSite.isLoading ||
      subscription.isLoading

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
      isLoading={isLoading}
      size={size}
      aria-label="follow"
      isAutoWidth
    >
      {subscription.data ? (
        <>
          <span className="group-hover:hidden inline-flex items-center">
            <span className="i-mingcute-user-follow-fill inline-block sm:mr-2"></span>{" "}
            <span className="hidden sm:inline">{t("Following")}</span>
          </span>
          <span className="hidden group-hover:inline-flex items-center">
            <span className="i-mingcute-user-remove-fill inline-block sm:mr-2"></span>{" "}
            <span className="hidden sm:inline">{t("Unfollow")}</span>
          </span>
        </>
      ) : (
        <span className="inline-flex items-center">
          {!isLoading && (
            <span className="i-mingcute-user-add-fill inline-block sm:mr-2"></span>
          )}{" "}
          <span className="hidden sm:inline">{t("Follow")}</span>
        </span>
      )}
    </Button>
  )
}
