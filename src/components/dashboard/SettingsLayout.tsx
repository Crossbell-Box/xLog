import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import React from "react"

import { useXSettingsModal } from "@crossbell/connect-kit"

import { Tabs, type TabItem } from "../ui/Tabs"
import { DashboardMain } from "./DashboardMain"

export const SettingsLayout = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => {
  const t = useTranslations()
  const xSettingsModal = useXSettingsModal()

  const params = useParams()
  const subdomain = params?.subdomain as string
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
  ]

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
