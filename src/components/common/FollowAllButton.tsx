"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"
import { useRefCallback } from "@crossbell/util-hooks"

import { Button } from "~/components/ui/Button"
import { getSubscriptionsFromList } from "~/models/site.model"
import { useSubscribeToSites } from "~/queries/site"

export const FollowAllButton = ({
  size,
  characterIds = [],
  siteIds = [],
  className,
}: {
  size?: "sm" | "xl"
  characterIds?: number[]
  siteIds?: string[]
  className?: string
}) => {
  const subscribeToSites = useSubscribeToSites()
  const t = useTranslations()
  const account = useAccountState((s) => s.computed.account)
  const [noMore, setNoMore] = useState(false)

  const doSubscribeToSites = useRefCallback(() => {
    if (account?.characterId) {
      getSubscriptionsFromList(characterIds, account.characterId).then(
        (res) => {
          const list = characterIds.filter((id) => !res.includes(id))
          if (list.length) {
            subscribeToSites.mutate({
              characterIds: list,
              siteIds: siteIds,
            } as any)
          } else {
            setNoMore(true)
          }
        },
      )
    } else {
      subscribeToSites.mutate({
        characterIds: characterIds,
        siteIds: siteIds,
      } as any)
    }
  })

  const followAll = () => {
    doSubscribeToSites()
  }

  return (
    <Button
      onClick={followAll}
      size={size}
      aria-label="follow"
      isAutoWidth
      className={className}
      isLoading={subscribeToSites.isLoading}
    >
      🥳{" "}
      {subscribeToSites.isSuccess || noMore
        ? t("Already Followed All!")
        : t("Follow All!")}
    </Button>
  )
}
