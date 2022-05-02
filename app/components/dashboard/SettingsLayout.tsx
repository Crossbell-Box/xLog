import { Outlet } from "@remix-run/react"
import { type TabItem, Tabs } from "../ui/Tabs"
import { DashboardMain } from "./DashboardMain"

export const SettingsLayout: React.FC<{
  title: string
  tabItems: TabItem[]
}> = ({ title, tabItems }) => {
  return (
    <DashboardMain>
      <div className="">
        <header className="mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
        </header>
        <div>
          <Tabs items={tabItems} />
          <div className="max-w-screen-md">
            <Outlet />
          </div>
        </div>
      </div>
    </DashboardMain>
  )
}
