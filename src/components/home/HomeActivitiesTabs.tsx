"use client"

import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"

import { useConnectedAction } from "@crossbell/connect-kit"

import topics from "../../../data/topics.json"
import { TabsComponent } from "../../components/ui/Tabs"

export const HomeActivitiesTabs = () => {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

  const tabs = [
    { text: "Featured", href: "/" },
    { text: "Shorts", href: "/shorts" },
    { text: "Latest", href: "/latest" },
    { text: "Hottest", href: "/hottest" },
    {
      text: "Following",
      onClick: useConnectedAction(() => router.push(`/following`)),
      active: pathname === "/following",
    },
    ...topics.map((topic) => ({
      text: t(topic.name),
      href: `/topic/${encodeURIComponent(topic.name)}`,
    })),
  ]

  return <TabsComponent items={tabs} className="border-none" />
}
