import { HomeActivitiesTabs } from "~/components/home/HomeActivitiesTabs"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import { APP_NAME } from "~/lib/env"
import { withHrefLang } from "~/lib/with-hreflang"

export const generateMetadata = withHrefLang(async () => ({
  title: `Activities - ${APP_NAME}`,
}))

export default async function ActivitiesLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <>
      <div className="flex-1 min-w-[300px]">
        <HomeActivitiesTabs />
        {children}
      </div>
      <div className="w-80 pl-10 hidden lg:block space-y-10">
        <HomeSidebar />
      </div>
    </>
  )
}
