import { Metadata } from "next"

import { HomeActivitiesTabs } from "~/components/home/HomeActivitiesTabs"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import { APP_NAME } from "~/lib/env"

export const metadata: Metadata = {
  title: `Activities - ${APP_NAME}`,
}

export default async function ActivitiesLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <HomeActivitiesTabs />
          {children}
        </div>
        <HomeSidebar />
      </div>
    </section>
  )
}
