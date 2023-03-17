import { cn } from "~/lib/utils"
import { useRouter } from "next/router"
import React, { useEffect } from "react"

import { DISCORD_LINK, APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { DashboardSidebar } from "./DashboardSidebar"
import { useAccountSites } from "~/queries/site"
import { ConnectButton } from "~/components/common/ConnectButton"
import { useGetSite } from "~/queries/site"
import { toGateway } from "~/lib/ipfs-parser"
import { Avatar } from "~/components/ui/Avatar"
import {
  useShowNotificationModal,
  useNotifications,
} from "@crossbell/notification"
import { useUserRole } from "~/hooks/useUserRole"
import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { useTranslation } from "react-i18next"
import { Logo } from "~/components/common/Logo"
import { getStorage } from "~/lib/storage"
import { useGetPagesBySite } from "~/queries/page"

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
  const userSite = useAccountSites()

  const userRole = useUserRole(subdomain)
  const [ssrReady, isConnected] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    !!computed.account,
  ])
  const connectModal = useConnectModal()
  const [ready, setReady] = React.useState(false)
  const [hasPermission, setHasPermission] = React.useState(false)
  const { t } = useTranslation("dashboard")

  useEffect(() => {
    if (ssrReady) {
      if (!isConnected) {
        setReady(false)
        setHasPermission(false)
        connectModal.show()
      } else if (userRole.isSuccess) {
        setReady(true)
        if (userRole.data) {
          setHasPermission(true)
        } else {
          setHasPermission(false)
        }
      }
    }
  }, [ssrReady, userRole.isSuccess, userRole.data, isConnected, connectModal])

  const showNotificationModal = useShowNotificationModal()
  const { isAllRead } = useNotifications()

  const pages = useGetPagesBySite({
    type: "post",
    site: "xlog-events",
    take: 1,
  })
  const [isEventsAllRead, setIsEventsAllRead] = React.useState(true)
  const latestEventRead = getStorage("latestEventRead")?.value || 0
  useEffect(() => {
    if (pages.isSuccess) {
      if (
        new Date(pages.data.pages[0].list?.[0].date_created) >
        new Date(latestEventRead)
      ) {
        setIsEventsAllRead(false)
      } else {
        setIsEventsAllRead(true)
      }
    }
  }, [pages.isSuccess, pages.data?.pages, latestEventRead])

  const links: {
    href?: string
    onClick?: () => void
    isActive: (ctx: { href: string; pathname: string }) => boolean
    icon: React.ReactNode
    text: string
  }[] = [
    {
      href: `/dashboard/${subdomain}`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-grid-line",
      text: "Dashboard",
    },
    {
      href: `/dashboard/${subdomain}/posts`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-news-line",
      text: "Posts",
    },
    {
      href: `/dashboard/${subdomain}/pages`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-file-line",
      text: "Pages",
    },
    {
      href: `/dashboard/${subdomain}/import`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/import`),
      icon: "i-mingcute:file-import-line",
      text: "Import",
    },
    {
      onClick: showNotificationModal,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isAllRead
        ? "i-mingcute:notification-line"
        : "i-mingcute:notification-fill",
      text: isAllRead ? "Notifications" : "Unread notifications",
    },
    {
      href: `/dashboard/${subdomain}/events`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isEventsAllRead
        ? "i-mingcute-flag-4-line"
        : "i-mingcute-flag-4-fill",
      text: isEventsAllRead ? "Events" : "New Events",
    },
    {
      href: `/dashboard/${subdomain}/achievements`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-trophy-line",
      text: "Achievements",
    },
    {
      href: `/dashboard/${subdomain}/settings/general`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/settings`),
      icon: "i-mingcute-settings-3-line",
      text: "Settings",
    },
  ]

  return ready ? (
    hasPermission ? (
      <>
        <SEOHead title={t(title) || ""} siteName={APP_NAME} />
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
        <div className="flex h-screen">
          <DashboardSidebar>
            {(isOpen) => (
              <>
                <div className="mb-2 px-5 pt-3 pb-2 text-2xl font-extrabold flex items-center">
                  <div className="inline-block w-9 h-9 mr-3">
                    <Logo
                      type="lottie"
                      width={36}
                      height={36}
                      autoplay={false}
                    />
                  </div>
                  {isOpen && "xLog"}
                </div>
                {userSite.data?.[0]?.username &&
                  subdomain &&
                  userSite.data[0].username !== subdomain && (
                    <div className="mb-2 px-5 pt-3 pb-2 bg-orange-50 text-center">
                      <div className="mb-2">
                        {isOpen && "You are operating"}
                      </div>
                      <Avatar
                        images={site.data?.avatars || []}
                        size={isOpen ? 60 : 40}
                        name={site.data?.name}
                      />
                      {isOpen && (
                        <span className="flex flex-col justify-center">
                          <span className="block">{site.data?.name}</span>
                          <span className="block text-sm text-zinc-400">
                            @{site.data?.username}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                <div className="mb-2 px-2 pt-3 pb-2">
                  <ConnectButton
                    left={true}
                    size="base"
                    hideNotification={true}
                    hideName={!isOpen}
                  />
                </div>

                <div className="px-3 space-y-[2px] text-zinc-500">
                  {links.map((link) => {
                    const active =
                      link.href &&
                      link.isActive({
                        pathname: router.asPath,
                        href: link.href,
                      })
                    return (
                      <UniLink
                        href={link.href}
                        key={link.text}
                        className={cn(
                          `flex px-4 h-12 items-center rounded-md space-x-2 w-full transition-colors`,
                          active
                            ? `bg-slate-200 font-medium text-accent`
                            : `hover:bg-slate-200 hover:bg-opacity-50`,
                          !isOpen && "justify-center",
                        )}
                        onClick={link.onClick}
                      >
                        <span className={cn(link.icon, "text-xl")}></span>
                        {isOpen && <span>{t(link.text)}</span>}
                      </UniLink>
                    )
                  })}
                </div>

                <div className="absolute bottom-5 left-0 right-0 flex items-center px-4 flex-col">
                  <UniLink
                    href={DISCORD_LINK}
                    className="space-x-1 text-zinc-500 hover:text-zinc-800 flex w-full h-12 items-center justify-center transition-colors mb-2"
                  >
                    <i className="i-mingcute:question-line text-lg" />
                    {isOpen && <span>{t("Need help?")}</span>}
                  </UniLink>
                  <UniLink
                    href={getSiteLink({
                      subdomain,
                    })}
                    className="space-x-2 border rounded-lg bg-slate-100 border-slate-200 text-accent hover:scale-105 transition-transform flex w-full h-12 items-center justify-center"
                  >
                    <span className="i-mingcute:home-1-line"></span>
                    {isOpen && <span>{t("View Site")}</span>}
                  </UniLink>
                </div>
              </>
            )}
          </DashboardSidebar>
          {children}
        </div>
      </>
    ) : (
      <div className="w-screen h-screen flex items-center justify-center flex-col">
        <ConnectButton size="base" />
        <div className="mt-8">
          Sorry, you do not have permission to access the current page.
        </div>
        <div className="mt-4">
          Please switch account or request the owner to set you as the operator.
        </div>
        <UniLink href="/dashboard" className="mt-4 text-accent">
          Take me to my own dashboard
        </UniLink>
      </div>
    )
  ) : (
    <div className="w-screen h-screen flex justify-center items-center">
      Loading...
    </div>
  )
}
