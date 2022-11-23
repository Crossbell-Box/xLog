import { useRouter } from "next/router"
import React from "react"
import { type TabItem, Tabs } from "../ui/Tabs"
import { DashboardMain } from "./DashboardMain"

export const SettingsLayout: React.FC<{
  title: string
  children: React.ReactNode
  type: "site" | "account"
}> = ({ title, children, type }) => {
  const router = useRouter()

  const subdomain = router.query.subdomain as string
  const tabItems: TabItem[] = (
    type === "site"
      ? [
          { text: "General", href: `/dashboard/${subdomain}/settings/general` },
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
            text: "Export data",
            href: `https://export.crossbell.io/?handle=${subdomain}`,
          },
        ]
      : [{ text: "Profile", href: `/dashboard/${subdomain}/account/profile` }]
  ).map((item) => ({ ...item, active: router.asPath === item.href }))

  return (
    <DashboardMain>
      <div className="">
        <header className="mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
        </header>
        <div>
          <Tabs items={tabItems} />
          <div className="max-w-screen-md">{children}</div>
        </div>
      </div>
    </DashboardMain>
  )
}
