import { useLocation, useParams } from "@remix-run/react"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { type TabItem } from "~/components/ui/Tabs"

export default function AccountLayoutPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const location = useLocation()
  const tabItems: TabItem[] = [
    { text: "Profile", href: `/dashboard/${subdomain}/account/profile` },
  ].map((item) => ({ ...item, active: location.pathname === item.href }))
  return <SettingsLayout title="Account" tabItems={tabItems} />
}
