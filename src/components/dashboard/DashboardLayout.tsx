import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import { APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { SEOHead } from "../common/SEOHead"
import { DashboardIcon } from "../icons/DashboardIcon"
import { UniLink } from "../ui/UniLink"
import { DashboardSidebar } from "./DashboardSidebar"
import { SiteSwitcher } from "./SiteSwitcher"
import { useGetUserSites } from "~/queries/site"
import { useAccount } from "wagmi"
import { ConnectButton } from "~/components/common/ConnectButton"
import { useGetNotifications, useGetSite } from "~/queries/site"
import { getStorage } from "~/lib/storage"

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
      if (!userSite.data?.find((site) => site.username === subdomain)) {
        router.push("/dashboard")
      }
    }
  }, [address, router, userSite.isSuccess, userSite.data, subdomain])

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
      <style>{site.data?.css}</style>
      <div className="flex">
        <DashboardSidebar>
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
                <Link href={link.href} key={link.href}>
                  <a
                    className={clsx(
                      `flex px-2 h-8 text-sm items-center rounded-lg space-x-2`,
                      active
                        ? `bg-gray-200 font-medium text-gray-800`
                        : `hover:bg-gray-200 hover:bg-opacity-50`,
                    )}
                  >
                    <span className={clsx(link.icon, "text-lg")}></span>
                    <span>{link.text}</span>
                  </a>
                </Link>
              )
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center px-4">
            <UniLink
              href={getSiteLink({
                subdomain,
                domain: userSite.data?.[0]?.custom_domain,
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
