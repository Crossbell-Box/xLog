import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import React from "react"

import { useXSettingsModal } from "@crossbell/connect-kit"

import { type TabItem, Tabs } from "../ui/Tabs"
import { DashboardMain } from "./DashboardMain"

export const SettingsLayout: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => {
  const router = useRouter()
  const { t } = useTranslation("dashboard")
  const xSettingsModal = useXSettingsModal()

  const subdomain = router.query.subdomain as string
  const tabItems: TabItem[] = [
    { text: "General", href: `/dashboard/${subdomain}/settings/general` },
    {
      text: "Social Platforms",
      href: `/dashboard/${subdomain}/settings/social-platforms`,
    },
    {
      text: "Navigation",
      href: `/dashboard/${subdomain}/settings/navigation`,
    },
    { text: "Domains", href: `/dashboard/${subdomain}/settings/domains` },
    { text: "Custom CSS", href: `/dashboard/${subdomain}/settings/css` },
    {
      text: "Operators",
      href: `/dashboard/${subdomain}/settings/operator`,
    },
    {
      text: "xSettings",
      onClick: () => xSettingsModal.show(),
    },
    {
      text: "Export data",
      href: `https://export.crossbell.io/?handle=${subdomain}`,
    },
  ].map((item) => ({ ...item, active: router.asPath === item.href }))

  return (
    <DashboardMain>
      <div className="">
        <header className="mb-8">
          <h2 className="text-2xl font-bold">{t(title)}</h2>
        </header>
        <div>
          <Tabs items={tabItems} />
          <div className="max-w-screen-md">{children}</div>
        </div>
      </div>
    </DashboardMain>
  )
}
