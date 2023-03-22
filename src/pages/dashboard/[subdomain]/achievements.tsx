import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import type { ReactElement } from "react"
import { useGetAchievements, useGetSite } from "~/queries/site"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useAccountState } from "@crossbell/connect-kit"
import { AchievementItem } from "~/components/common/AchievementItem"
import { useRouter } from "next/router"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function AchievementsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const site = useGetSite(subdomain)

  const achievement = useGetAchievements(site.data?.metadata?.proof)

  return (
    <DashboardMain title="Achievements">
      <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-8">
        <>
          {achievement.data?.list?.map((series) => {
            let length = series.groups?.length
            if (!length) {
              return null
            }
            return (
              <div key={series.info.name}>
                <div className="text-lg font-medium mb-4">
                  {series.info.title}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-x-2 gap-y-5">
                  {series.groups?.map((group) => (
                    <AchievementItem
                      group={group}
                      key={group.info.name}
                      layoutId="achievements"
                      size={80}
                      characterId={site.data?.metadata?.proof}
                      isOwner={true}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      </div>
    </DashboardMain>
  )
}

AchievementsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Achievements">{page}</DashboardLayout>
}
