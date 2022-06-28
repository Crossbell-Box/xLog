import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import { APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { trpc } from "~/lib/trpc"
import { SEOHead } from "../common/SEOHead"
import { DashboardIcon } from "../icons/DashboardIcon"
import { UniLink } from "../ui/UniLink"
import { DashboardSidebar } from "./DashboardSidebar"
import { SiteSwitcher } from "./SiteSwitcher"
import { getUserSites } from "~/models/site.model"
import { useAccount } from 'wagmi'
import type { Profile } from "unidata.js"

export function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const { data: viewer } = useAccount()

  let [subscriptions, setSubscriptions] = useState<Profile[]>([])

  useEffect(() => {
    if (viewer?.address) {
      getUserSites(viewer.address).then((sites) => {
        setSubscriptions(sites || [])
      })
    }
  }, [viewer?.address])

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
      <div className="flex">
        <DashboardSidebar>
          <div className="mb-2">
            <SiteSwitcher
              subdomain={subdomain}
              subscriptions={subscriptions}
              viewer={viewer}
            />
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
              href={getSiteLink({ subdomain })}
              className="space-x-2 border rounded-lg bg-gray-100 border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-500 flex w-full h-12 items-center justify-center transition-colors"
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
