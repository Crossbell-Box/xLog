import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { Image } from "~/components/ui/Image"
import type { ReactElement } from "react"
import { useGetAchievements, useGetSite } from "~/queries/site"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useGetPagesBySite } from "~/queries/page"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { useEffect, useState } from "react"
import { Avatar } from "~/components/ui/Avatar"
import { cn } from "~/lib/utils"
import { getSiteLink } from "~/lib/helpers"
import { getStorage, setStorage } from "~/lib/storage"
import { useAccountState } from "@crossbell/connect-kit"
import { AchievementItem } from "~/components/common/AchievementItem"

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
  const date = useDate()
  const { t } = useTranslation("dashboard")

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )
  const achievement = useGetAchievements(currentCharacterId || 0)

  return (
    <DashboardMain title="Achievements">
      <div className="min-w-[270px] max-w-screen-xl flex flex-col xl:flex-row space-y-8 xl:space-y-0">
        <>
          {achievement.data?.list?.map((series) => {
            let length = series.groups.length
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
                      characterId={currentCharacterId}
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
