import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { PagesManager } from "~/components/dashboard/PagesManager"
import type { ReactElement } from "react"

export default function SubdomainPages() {
  return <PagesManager isPost={false} />
}

SubdomainPages.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Pages">{page}</DashboardLayout>
}
