"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Avatar } from "~/components/ui/Avatar"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { useDate } from "~/hooks/useDate"
import { getSiteLink } from "~/lib/helpers"
import { getStorage, setStorage } from "~/lib/storage"
import { cn } from "~/lib/utils"
import { useGetPagesBySite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

function SiteAvatar({ siteId }: { siteId: string }) {
  const site = useGetSite(siteId)
  return (
    <div className="inline-block size-10 relative">
      <CharacterFloatCard siteId={siteId}>
        <UniLink
          href={getSiteLink({
            subdomain: siteId,
          })}
        >
          <Avatar
            cid={site.data?.characterId}
            images={site.data?.metadata?.content?.avatars || []}
            name={site.data?.metadata?.content?.name || ""}
            size={40}
          />
        </UniLink>
      </CharacterFloatCard>
    </div>
  )
}

export default function EventsPage() {
  const date = useDate()
  const t = useTranslations()
  const pages = useGetPagesBySite({
    type: "post",
    characterId: 50153,
    limit: 100,
  })

  const [latestEventRead, setLatestEventRead] = useState<Date>()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setLatestEventRead(new Date(getStorage("latestEventRead")?.value || 0))
    setStorage("latestEventRead", {
      value: new Date().toISOString(),
    })
  }, [])

  pages.data?.pages[0]?.list.forEach((item) => {
    item.metadata?.content?.frontMatter?.Winners
  })

  return (
    <DashboardMain title="Events">
      <div className="min-w-[270px] max-w-screen-xl flex flex-col xl:flex-row space-y-8 xl:space-y-0">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {pages.data?.pages[0]?.list.map((item) => {
            let status
            if (item.metadata?.content?.frontMatter?.EndTime < new Date()) {
              status = "Ended"
            } else if (
              item.metadata?.content?.frontMatter?.StartTime > new Date()
            ) {
              status = "Upcoming"
            } else {
              status = "Ongoing"
            }

            let isUnread = false
            if (latestEventRead && new Date(item.createdAt) > latestEventRead) {
              isUnread = true
            }
            return (
              <div
                className={cn("bg-slate-100 rounded-lg relative", {
                  "opacity-70": status === "Ended",
                })}
                key={item.transactionHash}
              >
                {isUnread && (
                  <div>
                    <span className="absolute -left-2 -top-2 bg-red-500 rounded-full size-4"></span>
                  </div>
                )}
                <div className="flex flex-col p-7 justify-between h-full">
                  <div>
                    <div className="font-bold mb-4">
                      <span
                        className={cn(
                          "border py-1 px-4 rounded-full text-white",
                          {
                            "bg-gray-500": status === "Ended",
                            "bg-green-500": status === "Upcoming",
                            "bg-yellow-500": status === "Ongoing",
                          },
                        )}
                      >
                        {t(status)}
                      </span>
                    </div>
                    {item.metadata?.content?.cover && (
                      <div className="w-full h-24 mb-4">
                        <Image
                          className="object-cover rounded"
                          alt="cover"
                          fill={true}
                          src={item.metadata?.content?.cover}
                        ></Image>
                      </div>
                    )}
                    <div className="font-bold text-xl text-zinc-800 leading-tight">
                      {item.metadata?.content?.title}
                    </div>
                  </div>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <span className="font-bold">{t("Date")}:</span>{" "}
                      {date.formatDate(
                        item.metadata?.content?.frontMatter?.StartTime,
                        "lll",
                        isMounted ? undefined : "America/Los_Angeles",
                      )}{" "}
                      -{" "}
                      {date.formatDate(
                        item.metadata?.content?.frontMatter?.EndTime,
                        "lll",
                        isMounted ? undefined : "America/Los_Angeles",
                      )}
                    </div>
                    <div>
                      <span className="font-bold">{t("Prize")}:</span>{" "}
                      {item.metadata?.content?.frontMatter?.Prize}
                    </div>
                    {item.metadata?.content?.frontMatter?.Winners?.map && (
                      <div>
                        <span className="font-bold">{t("Winners")}:</span>
                        <div className="flex items-center space-x-2 mt-2">
                          {item.metadata?.content?.frontMatter?.Winners?.map?.(
                            (winner: string) => (
                              <SiteAvatar key={winner} siteId={winner} />
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <UniLink
                    className="mt-6 font-bold flex items-center leading-none"
                    href={
                      item.metadata?.content?.frontMatter?.ExtraLink ||
                      `/api/redirection?characterId=${item.characterId}&noteId=${item.noteId}`
                    }
                  >
                    {t("Learn more")}{" "}
                    <i className="i-mingcute-right-line text-xl ml-1" />
                  </UniLink>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardMain>
  )
}
