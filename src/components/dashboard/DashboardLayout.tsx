import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import { APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { DashboardSidebar } from "./DashboardSidebar"
import { useGetUserSites } from "~/queries/site"
import { useAccount } from "wagmi"
import { ConnectButton } from "~/components/common/ConnectButton"
import { useGetNotifications, useGetSite, useIsOperators } from "~/queries/site"
import { getStorage } from "~/lib/storage"
import { toGateway } from "~/lib/ipfs-parser"
import { Avatar } from "~/components/ui/Avatar"

export function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const site = useGetSite(subdomain)

  const { address } = useAccount()

  const userSite = useGetUserSites(address)

  const notifications = useGetNotifications({
    siteCId: site.data?.metadata?.proof,
  })

  const isOperator = useIsOperators({
    characterId: +(site.data?.metadata?.proof || 0),
    operator: address,
  })

  const notificationCreatedAt =
    getStorage(`notification-${subdomain}`)?.createdAt || 0

  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (notifications.data && subdomain) {
      const count = notifications.data.filter(
        (notification: any) =>
          +new Date(notification.createdAt) > +new Date(notificationCreatedAt),
      ).length
      setNotificationCount(count)
    }
  }, [notifications.data, subdomain, notificationCreatedAt])

  useEffect(() => {
    if (!address) {
      router.push("/")
    }
    if (userSite.isSuccess && subdomain) {
      if (
        !userSite.data?.find((site) => site.username === subdomain) &&
        !isOperator.data
      ) {
        router.push("/dashboard")
      }
    }
  }, [
    address,
    router,
    userSite.isSuccess,
    userSite.data,
    subdomain,
    isOperator.data,
  ])

  const links: {
    href: string
    isActive: (ctx: { href: string; pathname: string }) => boolean
    icon: React.ReactNode
    text: string
  }[] = [
    {
      href: `/dashboard/${subdomain}`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-bi-grid",
      text: "Dashboard",
    },
    {
      href: `/dashboard/${subdomain}/posts`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-bi-layout-text-sidebar",
      text: "Posts",
    },
    {
      href: `/dashboard/${subdomain}/pages`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-bi-window-stack",
      text: "Pages",
    },
    {
      href: `/dashboard/${subdomain}/notifications`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: notificationCount > 0 ? "i-bi:bell-fill" : "i-bi:bell",
      text:
        "Notifications" +
        (notificationCount > 0 ? ` (${notificationCount})` : ""),
    },
    {
      href: `/dashboard/${subdomain}/settings/general`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/settings`),
      icon: "i-bi-gear",
      text: "Settings",
    },
  ]

  return (
    <>
      <SEOHead title={title} siteName={APP_NAME} />
      {site?.data?.css && (
        <link
          type="text/css"
          rel="stylesheet"
          href={
            "data:text/css;base64," +
            Buffer.from(toGateway(site.data.css)).toString("base64")
          }
        />
      )}
      <div className="flex">
        <DashboardSidebar>
          {userSite.data?.[0].username !== subdomain && (
            <div className="mb-2 px-5 pt-3 pb-2 bg-orange-50 text-center">
              <div className="mb-2">You are operating</div>
              <Avatar
                images={site.data?.avatars || []}
                size={60}
                name={site.data?.name}
              />
              <span className="flex flex-col justify-center">
                <span className="block">{site.data?.name}</span>
                <span className="block text-sm text-zinc-400">
                  @{site.data?.username}
                </span>
              </span>
            </div>
          )}
          <div className="mb-2 px-5 pt-3 pb-2">
            <ConnectButton left={true} />
          </div>

          <div className="px-3 space-y-[2px] text-zinc-500">
            {links.map((link) => {
              const active = link.isActive({
                pathname: router.asPath,
                href: link.href,
              })
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  className={clsx(
                    `flex px-2 h-8 text-sm items-center rounded-lg space-x-2`,
                    active
                      ? `bg-gray-200 font-medium text-gray-800`
                      : `hover:bg-gray-200 hover:bg-opacity-50`,
                  )}
                >
                  <span className={clsx(link.icon, "text-lg")}></span>
                  <span>{link.text}</span>
                </Link>
              )
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center px-4">
            <UniLink
              href={getSiteLink({
                subdomain,
              })}
              className="space-x-2 border rounded-lg bg-gray-100 border-gray-200 text-gray-500 hover:text-accent flex w-full h-12 items-center justify-center transition-colors"
            >
              <span className="i-bi:box-arrow-up-right"></span>
              <span>View Site</span>
            </UniLink>
          </div>
        </DashboardSidebar>
        {children}
      </div>
    </>
  )
}
