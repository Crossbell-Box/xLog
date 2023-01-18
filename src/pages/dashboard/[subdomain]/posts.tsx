import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { PagesManager } from "~/components/dashboard/PagesManager"
import type { ReactElement } from "react"

export default function SubdomainPosts() {
  return <PagesManager isPost={true} />
}

SubdomainPosts.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Posts">{page}</DashboardLayout>
}
