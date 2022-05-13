import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { PagesManager } from "~/components/dashboard/PagesManager"

export default function SubdomainPosts() {
  return (
    <DashboardLayout>
      <PagesManager isPost={true} />
    </DashboardLayout>
  )
}
