import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { Image } from "~/components/ui/Image"
import type { ReactElement } from "react"
import { useGetSite } from "~/queries/site"
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

function SiteAvatar({ siteId }: { siteId: string }) {
  const site = useGetSite(siteId)
  return (
    <div className="inline-block w-10 h-10 relative">
      <CharacterFloatCard siteId={siteId}>
        <UniLink
          href={getSiteLink({
            subdomain: siteId,
          })}
        >
          <Avatar
            images={site.data?.avatars || []}
            name={site.data?.name || ""}
            size={40}
          />
        </UniLink>
      </CharacterFloatCard>
    </div>
  )
}

export default function EventsPage() {
  const date = useDate()
  const { t } = useTranslation("dashboard")
  const pages = useGetPagesBySite({
    type: "post",
    site: "xlog-events",
    take: 100,
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
    item.metadata?.frontMatter?.Winners
  })

  return (
    <DashboardMain title="Events">
      <div className="min-w-[270px] max-w-screen-xl flex flex-col xl:flex-row space-y-8 xl:space-y-0">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {pages.data?.pages[0]?.list.map((item) => {
            let status
            if (item.metadata?.frontMatter?.EndTime < new Date()) {
              status = "Ended"
            } else if (item.metadata?.frontMatter?.StartTime > new Date()) {
              status = "Upcoming"
            } else {
              status = "Ongoing"
            }

            let isUnread = false
            if (
              latestEventRead &&
              new Date(item.date_created) > latestEventRead
            ) {
              isUnread = true
            }
            return (
              <div
                className={cn("bg-slate-100 rounded-lg relative", {
                  "opacity-70": status === "Ended",
                })}
                key={item.id}
              >
                {isUnread && (
                  <div>
                    <span className="absolute -left-2 -top-2 bg-red-500 rounded-full w-4 h-4"></span>
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
                    {item.cover && (
                      <div className="w-full h-24 mb-4">
                        <Image
                          className="object-cover rounded"
                          alt="cover"
                          fill={true}
                          src={item.cover}
                        ></Image>
                      </div>
                    )}
                    <div className="font-bold text-xl text-zinc-800 leading-tight">
                      {item.title}
                    </div>
                  </div>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <span className="font-bold">{t("Date")}:</span>{" "}
                      {date.formatDate(
                        item.metadata?.frontMatter?.StartTime,
                        "lll",
                        isMounted ? undefined : "America/Los_Angeles",
                      )}{" "}
                      -{" "}
                      {date.formatDate(
                        item.metadata?.frontMatter?.EndTime,
                        "lll",
                        isMounted ? undefined : "America/Los_Angeles",
                      )}
                    </div>
                    <div>
                      <span className="font-bold">{t("Prize")}:</span>{" "}
                      {item.metadata?.frontMatter?.Prize}
                    </div>
                    {item.metadata?.frontMatter?.Winners?.map && (
                      <div>
                        <span className="font-bold">{t("Winners")}:</span>
                        <div className="flex items-center space-x-2 mt-2">
                          {item.metadata?.frontMatter?.Winners?.map?.(
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
                      item.metadata?.frontMatter?.ExtraLink ||
                      item.related_urls?.[0]
                    }
                  >
                    {t("Learn more")}{" "}
                    <i className="i-mingcute:right-line text-xl ml-1" />
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

EventsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Events">{page}</DashboardLayout>
}
