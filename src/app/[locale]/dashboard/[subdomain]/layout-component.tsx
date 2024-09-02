"use client"

import { useTranslations } from "next-intl"
import {
  useParams,
  usePathname,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation"
import React, { useEffect } from "react"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import {
  useNotifications,
  useShowNotificationModal,
} from "@crossbell/notification"

import { ConnectButton } from "~/components/common/ConnectButton"
import { Loading } from "~/components/common/Loading"
import { Logo } from "~/components/common/Logo"
import { DashboardTopbar } from "~/components/dashboard/DashboardTopbar"
import { Avatar } from "~/components/ui/Avatar"
import { UniLink } from "~/components/ui/UniLink"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useUserRole } from "~/hooks/useUserRole"
import { DISCORD_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { toGateway } from "~/lib/ipfs-parser"
import { getStorage } from "~/lib/storage"
import { cn } from "~/lib/utils"
import { useGetPagesBySite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const searchParams = useSearchParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)

  const userRole = useUserRole(subdomain)
  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])
  const connectModal = useConnectModal()
  const [ready, setReady] = React.useState(false)
  const [hasPermission, setHasPermission] = React.useState(false)
  const t = useTranslations()

  const isMobileLayout = useIsMobileLayout()
  const pathname = usePathname()

  useEffect(() => {
    if (ssrReady) {
      if (!account) {
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
  }, [ssrReady, userRole.isSuccess, userRole.data, account, connectModal])

  const showNotificationModal = useShowNotificationModal()
  const { isAllRead } = useNotifications()

  const pages = useGetPagesBySite({
    type: "post",
    characterId: 50153,
    limit: 1,
  })
  const [isEventsAllRead, setIsEventsAllRead] = React.useState(true)
  const latestEventRead = getStorage("latestEventRead")?.value || 0
  useEffect(() => {
    if (pages.isSuccess) {
      if (
        new Date(pages.data.pages[0].list?.[0].createdAt) >
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
    isActive: (ctx: {
      href: string
      pathname: string | null
      searchParams?: ReadonlyURLSearchParams
    }) => boolean
    icon: React.ReactNode
    text: string
    lever?: number
  }[] = [
    {
      href: `/dashboard/${subdomain}`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-grid-line",
      text: "Dashboard",
    },
    {
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-add-circle-line",
      text: "Publishing",
    },
    {
      href: `/dashboard/${subdomain}/posts`,
      isActive: ({ href, pathname, searchParams }) =>
        href === pathname || searchParams?.get("type") === "post",
      icon: "i-mingcute-news-line",
      text: "Posts",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/pages`,
      isActive: ({ href, pathname, searchParams }) =>
        href === pathname || searchParams?.get("type") === "page",
      icon: "i-mingcute-file-line",
      text: "Pages",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/shorts`,
      isActive: ({ href, pathname, searchParams }) =>
        href === pathname || searchParams?.get("type") === "short",
      icon: "i-mingcute-ins-line",
      text: "Shorts",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/portfolios`,
      isActive: ({ href, pathname, searchParams }) =>
        href === pathname || searchParams?.get("type") === "portfolio",
      icon: "i-mingcute-cloud-line",
      text: "Portfolios",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/import`,
      isActive: ({ pathname }) =>
        !!pathname?.startsWith(`/dashboard/${subdomain}/import`),
      icon: "i-mingcute-file-import-line",
      text: "Import",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/events`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isEventsAllRead
        ? "i-mingcute-flag-4-line"
        : "i-mingcute-flag-4-fill",
      text: isEventsAllRead ? "Events" : "New Events",
      lever: 2,
    },
    {
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-heartbeat-line",
      text: "Interaction",
    },
    {
      onClick: showNotificationModal,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isAllRead
        ? "i-mingcute-notification-line"
        : "i-mingcute-notification-fill",
      text: isAllRead ? "Notifications" : "Unread notifications",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/comments`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-comment-line",
      text: "Comments",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/achievements`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-trophy-line",
      text: "Achievements",
      lever: 2,
    },
    {
      href: `/dashboard/${subdomain}/tokens`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "i-mingcute-pig-money-line",
      text: "Tokens",
    },
    {
      href: `/dashboard/${subdomain}/settings/general`,
      isActive: ({ pathname }) =>
        !!pathname?.startsWith(`/dashboard/${subdomain}/settings`),
      icon: "i-mingcute-settings-3-line",
      text: "Settings",
    },
  ]

  return ready ? (
    hasPermission ? (
      <>
        {/* TODO */}
        {/* <SEOHead title={t(title) || ""} siteName={APP_NAME} /> */}
        {site?.data?.metadata?.content?.css && (
          <link
            type="text/css"
            rel="stylesheet"
            href={
              "data:text/css;base64," +
              Buffer.from(toGateway(site.data.metadata?.content?.css)).toString(
                "base64",
              )
            }
          />
        )}
        <div className="flex h-screen bg-slate-100">
          {isMobileLayout ? (
            <DashboardTopbar
              userWidget={
                <div className="mb-2 px-2 pt-3 pb-2">
                  <ConnectButton
                    left={true}
                    size="base"
                    hideNotification={true}
                    hideName={false}
                  />
                </div>
              }
              drawerWidget={(close: any) => (
                <>
                  <div className="flex-1 min-h-0 flex flex-col h-full">
                    <UniLink
                      href="/"
                      className="mb-2 px-5 pt-3 pb-2 text-2xl font-extrabold flex items-center"
                    >
                      <div className="inline-block size-9 mr-3">
                        <Logo
                          type="lottie"
                          width={36}
                          height={36}
                          autoplay={false}
                        />
                      </div>
                      xLog
                    </UniLink>
                    <div className="px-3 space-y-[2px] text-zinc-500 flex-1 min-h-0 overflow-y-auto">
                      {links.map((link) => {
                        const active =
                          link.href &&
                          link.isActive({
                            pathname: pathname,
                            href: link.href,
                          })
                        return (
                          <div key={link.text} onClick={() => close()}>
                            <UniLink
                              href={link.href}
                              className={cn(
                                `flex px-4 h-12 items-center rounded-xl space-x-2 w-full transition-colors`,
                                active
                                  ? `bg-white font-medium text-accent drop-shadow-sm`
                                  : link.href || link.onClick
                                    ? "hover:bg-slate-200/50"
                                    : "opacity-80 cursor-default",
                              )}
                              onClick={link.onClick}
                            >
                              <i
                                className={cn(link.icon, "text-xl")}
                                style={{
                                  marginLeft: link.lever
                                    ? (link.lever - 1) * 20
                                    : 0,
                                }}
                              ></i>
                              <span className="truncate">{t(link.text)}</span>
                            </UniLink>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center px-4 flex-col pb-4">
                      <UniLink
                        href={DISCORD_LINK}
                        className="space-x-1 text-zinc-500 hover:text-zinc-800 flex w-full h-12 items-center justify-center transition-colors mb-2"
                      >
                        <i className="i-mingcute-question-line text-lg" />
                        {<span>{t("Need help?")}</span>}
                      </UniLink>
                      <UniLink
                        href={getSiteLink({
                          subdomain,
                        })}
                        className="space-x-2 border rounded-lg border-slate-200 text-accent hover:scale-105 transition-transform flex w-full h-12 items-center justify-center bg-white drop-shadow-sm"
                      >
                        <span className="i-mingcute-home-1-line"></span>
                        {<span>{t("View Site")}</span>}
                      </UniLink>
                    </div>
                  </div>
                </>
              )}
            >
              {(isOpen) => <div>233</div>}
            </DashboardTopbar>
          ) : (
            <div
              className={`w-sidebar transition-[width] relative shrink-0 z-10`}
            >
              <div
                className={`w-sidebar transition-[width] fixed h-full flex flex-col`}
              >
                <div className="flex-1 min-h-0 flex flex-col">
                  <UniLink
                    href="/"
                    className="mb-2 px-5 pt-3 pb-2 text-2xl font-extrabold flex items-center"
                  >
                    <div className="inline-block size-9 mr-3">
                      <Logo
                        type="lottie"
                        width={36}
                        height={36}
                        autoplay={false}
                      />
                    </div>
                    xLog
                  </UniLink>
                  {account?.character?.handle &&
                    subdomain &&
                    account?.character?.handle !== subdomain && (
                      <div className="mb-2 px-5 pt-3 pb-2 bg-orange-50 text-center">
                        <div className="mb-2">You are operating</div>
                        <Avatar
                          cid={site.data?.characterId}
                          images={site.data?.metadata?.content?.avatars || []}
                          size={60}
                          name={site.data?.metadata?.content?.name}
                        />
                        <span className="flex flex-col justify-center">
                          <span className="block">
                            {site.data?.metadata?.content?.name}
                          </span>
                          <span className="block text-sm text-zinc-400">
                            @{site.data?.handle}
                          </span>
                        </span>
                      </div>
                    )}
                  <div className="mb-2 px-2 pt-3 pb-2">
                    <ConnectButton
                      left={true}
                      size="base"
                      hideNotification={true}
                    />
                  </div>

                  <div className="px-3 space-y-[2px] text-zinc-500 flex-1 min-h-0 overflow-y-auto">
                    {links.map((link) => {
                      const active =
                        link.href &&
                        link.isActive({
                          pathname,
                          href: link.href,
                          searchParams,
                        })
                      return (
                        <UniLink
                          href={link.href}
                          key={link.text}
                          className={cn(
                            `flex px-4 h-12 items-center rounded-xl space-x-2 w-full transition-colors`,
                            active
                              ? `bg-white font-medium text-accent drop-shadow-sm`
                              : link.href || link.onClick
                                ? "hover:bg-slate-200/50"
                                : "opacity-80 cursor-default",
                          )}
                          onClick={link.onClick}
                        >
                          <i
                            className={cn(link.icon, "text-xl")}
                            style={{
                              marginLeft: link.lever
                                ? (link.lever - 1) * 20
                                : 0,
                            }}
                          ></i>
                          <span className="truncate">{t(link.text)}</span>
                        </UniLink>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center px-4 flex-col pb-4">
                  <UniLink
                    href={DISCORD_LINK}
                    className="space-x-1 text-zinc-500 hover:text-zinc-800 flex w-full h-12 items-center justify-center transition-colors mb-2"
                  >
                    <i className="i-mingcute-question-line text-lg" />
                    <span>{t("Need help?")}</span>
                  </UniLink>
                  <UniLink
                    href={getSiteLink({
                      subdomain,
                    })}
                    className="space-x-2 border rounded-lg border-slate-200 text-accent hover:scale-105 transition-transform flex w-full h-12 items-center justify-center bg-white drop-shadow-sm"
                  >
                    <span className="i-mingcute-home-1-line"></span>
                    <span>{t("View Site")}</span>
                  </UniLink>
                </div>
              </div>
            </div>
          )}

          <div
            className={cn(
              "lg:p-3 size-full",
              !isMobileLayout && "max-w-[calc(100vw-240px)]",
            )}
          >
            <div
              className={cn(
                `${isMobileLayout ? "pt-16 flex-1" : "flex-1 min-w-0"}`,
                "bg-white size-full lg:rounded-xl lg:drop-shadow overflow-y-auto",
              )}
            >
              {children}
            </div>
          </div>
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
    <Loading className="w-screen h-screen" />
  )
}
