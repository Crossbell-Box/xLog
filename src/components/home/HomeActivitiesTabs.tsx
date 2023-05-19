"use client"

import { usePathname, useRouter } from "next/navigation"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"

import { Tabs } from "~/components/ui/Tabs"

export const HomeActivitiesTabs = () => {
  const pathname = usePathname()
  const connectModal = useConnectModal()
  const router = useRouter()

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const tabs = [
    {
      text: "Latest",
      href: "/activities",
      active: pathname === "/activities",
    },
    {
      text: "Hottest",
      href: "/activities/hottest",
      active: pathname === "/activities/hottest",
    },
    {
      text: "Following",
      onClick: () => {
        if (!currentCharacterId) {
          connectModal.show()
        } else {
          router.push(`/activities/following`)
        }
      },
      active: pathname === "/activities/following",
    },
  ]

  return <Tabs items={tabs} className="border-none text-lg"></Tabs>
}
