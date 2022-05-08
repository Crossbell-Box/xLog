import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { PagesManager } from "~/components/dashboard/PagesManager"

export default function SubdomainPages() {
  return (
    <DashboardLayout>
      <PagesManager isPost={false} />
    </DashboardLayout>
  )
}
