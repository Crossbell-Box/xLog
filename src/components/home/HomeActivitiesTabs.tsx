"use client"

import { usePathname, useRouter } from "next/navigation"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"

import { Tabs } from "~/components/ui/Tabs"
import { useTranslation } from "~/lib/i18n/client"

import topics from "../../../data/topics.json"

export const HomeActivitiesTabs = () => {
  const pathname = usePathname()
  const connectModal = useConnectModal()
  const router = useRouter()
  const { t } = useTranslation("index")

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const tabs = [
    {
      text: "Latest",
      href: "/",
      active: pathname === "/",
    },
    {
      text: "Hottest",
      href: "/hottest",
      active: pathname === "/hottest",
    },
    {
      text: "Following",
      onClick: () => {
        if (!currentCharacterId) {
          connectModal.show()
        } else {
          router.push(`/following`)
        }
      },
      active: pathname === "/following",
    },
    ...topics.map((topic) => ({
      text: t(topic.name),
      href: `/topic/${encodeURIComponent(topic.name)}`,
      active: pathname === `/topic/${encodeURIComponent(topic.name)}`,
    })),
  ]

  return <Tabs items={tabs} className="border-none"></Tabs>
}
