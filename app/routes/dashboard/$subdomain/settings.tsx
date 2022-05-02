import { useLocation, useParams } from "@remix-run/react"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { type TabItem } from "~/components/ui/Tabs"

export default function SettingsLayoutPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const location = useLocation()
  const tabItems: TabItem[] = [
    { text: "General", href: `/dashboard/${subdomain}/settings/general` },
    { text: "Domains", href: `/dashboard/${subdomain}/settings/domains` },
  ].map((item) => ({ ...item, active: location.pathname === item.href }))
  return <SettingsLayout title="Site Settings" tabItems={tabItems} />
}
