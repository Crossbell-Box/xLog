import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { trpc } from "~/lib/trpc"
import { SEOHead } from "../common/SEOHead"
import { DashboardIcon } from "../icons/DashboardIcon"
import { UniLink } from "../ui/UniLink"
import { DashboardSidebar } from "./DashboardSidebar"
import { SiteSwitcher } from "./SiteSwitcher"

export function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const { data: subscriptions } = trpc.useQuery(
    ["user.getSubscriptions", { canManage: true }],
    {}
  )

  const { data: viewer } = trpc.useQuery(["auth.viewer"])

  const links: {
    href: string
    isActive: (ctx: { href: string; pathname: string }) => boolean
    icon: React.ReactNode
    text: string
  }[] = [
    {
      href: `/dashboard/${subdomain}`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: <DashboardIcon />,
      text: "Dashboard",
    },
    {
      href: `/dashboard/${subdomain}/posts`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: (
        <svg width="1em" height="1em" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
          ></path>
          <path
            fill="currentColor"
            d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
          ></path>
        </svg>
      ),
      text: "Posts",
    },
    {
      href: `/dashboard/${subdomain}/pages`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: (
        <svg width="1em" height="1em" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          >
            <path d="M12 11h5m-5-4h5m-9 8V3.6a.6.6 0 0 1 .6-.6h11.8a.6.6 0 0 1 .6.6V17a4 4 0 0 1-4 4v0"></path>
            <path d="M5 15h7.4c.331 0 .603.267.63.597C13.153 17.115 13.78 21 17 21H6a3 3 0 0 1-3-3v-1a2 2 0 0 1 2-2Z"></path>
          </g>
        </svg>
      ),
      text: "Pages",
    },
    {
      href: `/dashboard/${subdomain}/settings/general`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/settings`),
      icon: (
        <svg width="1em" height="1em" viewBox="0 0 16 16">
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="1.75"></circle>
            <path d="m6.75 1.75l-.5 1.5l-1.5 1l-2-.5l-1 2l1.5 1.5v1.5l-1.5 1.5l1 2l2-.5l1.5 1l.5 1.5h2.5l.5-1.5l1.5-1l2 .5l1-2l-1.5-1.5v-1.5l1.5-1.5l-1-2l-2 .5l-1.5-1l-.5-1.5z"></path>
          </g>
        </svg>
      ),
      text: "Settings",
    },
    {
      href: `/dashboard/${subdomain}/account/profile`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/account`),
      icon: (
        <svg width="1em" height="1em" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm-4.987-3.744A7.966 7.966 0 0 0 12 20a7.97 7.97 0 0 0 5.167-1.892A6.979 6.979 0 0 0 12.16 16a6.981 6.981 0 0 0-5.147 2.256zM5.616 16.82A8.975 8.975 0 0 1 12.16 14a8.972 8.972 0 0 1 6.362 2.634a8 8 0 1 0-12.906.187zM12 13a4 4 0 1 1 0-8a4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4a2 2 0 0 0 0 4z"
          ></path>
        </svg>
      ),
      text: "Account",
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
              subscriptions={subscriptions || []}
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
                      `flex px-2 h-8 text-sm items-center rounded-lg`,
                      active
                        ? `bg-gray-200 font-medium text-gray-800`
                        : `hover:bg-gray-200 hover:bg-opacity-50`
                    )}
                  >
                    <span className="mr-2 text-lg">{link.icon}</span>
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
              <svg width="1em" height="1em" viewBox="0 0 32 32">
                <path
                  fill="none"
                  stroke="currentcolor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 9H3v20h20V18M18 4h10v10m0-10L14 18"
                ></path>
              </svg>
              <span>View Site</span>
            </UniLink>
          </div>
        </DashboardSidebar>
        {children}
      </div>
    </>
  )
}
