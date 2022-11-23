import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import { useGetNotifications, useGetSite } from "~/queries/site"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { Avatar } from "~/components/ui/Avatar"
import dayjs from "~/lib/date"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN } from "~/lib/env"
import { PageContent } from "~/components/common/PageContent"
import { useEffect, useMemo, useState } from "react"
import { setStorage, getStorage } from "~/lib/storage"

export default function SubdomainIndex() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const site = useGetSite(subdomain)

  const notifications = useGetNotifications({
    siteCId: site.data?.metadata?.proof,
  })

  const [lastNotificationCreated, setLastNotificationCreated] = useState(0)

  useMemo(() => {
    if (subdomain && !lastNotificationCreated) {
      setLastNotificationCreated(
        +new Date(getStorage(`notification-${subdomain}`)?.createdAt || 1),
      )
    }
  }, [subdomain])

  useEffect(() => {
    if (notifications.data?.[0].createdAt && subdomain) {
      setStorage(`notification-${subdomain}`, {
        createdAt: notifications.data[0].createdAt,
      })
    }
  }, [notifications.data, subdomain])

  return (
    <DashboardLayout title="Dashboard">
      <DashboardMain>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="mt-4">
          Subscribing the{" "}
          <UniLink
            className="text-accent-emphasis"
            href={`${getSiteLink({
              subdomain: subdomain,
            })}/feed/notifications`}
          >
            notifications feed
          </UniLink>{" "}
          via RSS Reader is a great way to get notified in a timely manner.
        </p>
        <div className="xlog-comment">
          <div className="prose space-y-4 pt-4">
            {notifications.data?.map((notification) => {
              let key = ""
              let character
              let message = ""

              switch (notification.type) {
                case "notes":
                  if (
                    !notification.toNote.metadata?.content?.sources?.includes(
                      "xlog",
                    )
                  ) {
                    return null
                  }
                  key =
                    "notes" +
                    notification.characterId +
                    "-" +
                    notification.noteId
                  character = notification?.character
                  message = "commented on"
                  break
                case "backlinks":
                  key = "backlinks" + notification.fromCharacter.handle
                  character = notification.fromCharacter
                  message = "follows you"
                  break
              }

              return (
                <div key={key} className="border-t border-dashed pt-4">
                  <div className="flex group items-center relative">
                    {+new Date(notification.createdAt) >
                      +new Date(lastNotificationCreated) && (
                      <div className="absolute right-full text-xs pr-2 top-1/2 -translate-y-1/2 font-bold text-accent">
                        New
                      </div>
                    )}
                    <div>
                      <CharacterFloatCard siteId={character?.handle}>
                        <div>
                          <UniLink
                            href={
                              character?.handle &&
                              getSiteLink({
                                subdomain: character.handle,
                              })
                            }
                            className="block align-middle mr-3 text-[0px]"
                          >
                            <Avatar
                              images={
                                character?.metadata?.content?.avatars || []
                              }
                              name={character?.metadata?.content?.name}
                              size={35}
                            />
                          </UniLink>
                        </div>
                      </CharacterFloatCard>
                    </div>
                    <div className="flex-1 flex flex-col rounded-lg">
                      <div className="mb-1 text-sm">
                        <UniLink
                          href={
                            character?.handle &&
                            getSiteLink({
                              subdomain: character.handle,
                            })
                          }
                          className="font-medium text-accent"
                        >
                          {character?.metadata?.content?.name ||
                            character?.handle}
                        </UniLink>{" "}
                        {message}{" "}
                        <UniLink
                          href={`${getSiteLink({
                            subdomain: notification.toCharacter?.handle || "",
                          })}/${
                            notification.toNote?.metadata?.content?.attributes?.find(
                              (attribute: any) =>
                                attribute.trait_type === "xlog_slug",
                            )?.value ||
                            notification.toNote?.characterId +
                              "-" +
                              notification.toNote?.noteId
                          }`}
                        >
                          {notification.toNote?.metadata?.content?.title}
                        </UniLink>{" "}
                        ·{" "}
                        {dayjs
                          .duration(
                            dayjs(notification?.createdAt).diff(
                              dayjs(),
                              "minute",
                            ),
                            "minute",
                          )
                          .humanize()}{" "}
                        ago ·{" "}
                        <UniLink
                          href={`${CSB_SCAN}/tx/${notification.transactionHash}`}
                        >
                          <BlockchainIcon className="w-3 h-3 inline-block" />
                        </UniLink>
                      </div>
                      <PageContent
                        content={notification.metadata?.content?.content}
                      ></PageContent>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DashboardMain>
    </DashboardLayout>
  )
}
