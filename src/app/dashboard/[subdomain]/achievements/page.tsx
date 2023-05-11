"use client"

import { useParams } from "next/navigation"

import { AchievementItem } from "~/components/common/AchievementItem"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { useGetAchievements, useGetSite } from "~/queries/site"

export default function AchievementsPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)

  const achievement = useGetAchievements(site.data?.characterId)

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
                      characterId={site.data?.characterId}
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
