import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { PagesManager } from "~/components/dashboard/PagesManager"

export default function SubdomainPages() {
  return (
    <DashboardLayout title="Pages">
      <PagesManager isPost={false} />
    </DashboardLayout>
  )
}
