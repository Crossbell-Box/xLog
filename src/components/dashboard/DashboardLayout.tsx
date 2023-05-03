import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import {
  useNotifications,
  useShowNotificationModal,
} from "@crossbell/notification"

import { ConnectButton } from "~/components/common/ConnectButton"
import { Logo } from "~/components/common/Logo"
import { Avatar } from "~/components/ui/Avatar"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useUserRole } from "~/hooks/useUserRole"
import { APP_NAME, DISCORD_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { toGateway } from "~/lib/ipfs-parser"
import { getStorage } from "~/lib/storage"
import { cn } from "~/lib/utils"
import { useGetPagesBySite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { DashboardSidebar } from "./DashboardSidebar"
import { DashboardTopbar } from "./DashboardTopbar"

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

  const userRole = useUserRole(subdomain)
  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])
  const connectModal = useConnectModal()
  const [ready, setReady] = React.useState(false)
  const [hasPermission, setHasPermission] = React.useState(false)
  const { t } = useTranslation("dashboard")

  const isMobileLayout = useIsMobileLayout()

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
    isActive: (ctx: { href: string; pathname: string }) => boolean
    icon: React.ReactNode
    text: string
  }[] = [
    {
      href: `/dashboard/${subdomain}`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "icon-[mingcute--grid-line]",
      text: "Dashboard",
    },
    {
      href: `/dashboard/${subdomain}/posts`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "icon-[mingcute--news-line]",
      text: "Posts",
    },
    {
      href: `/dashboard/${subdomain}/pages`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "icon-[mingcute--file-line]",
      text: "Pages",
    },
    {
      href: `/dashboard/${subdomain}/comments`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "icon-[mingcute--comment-line]",
      text: "Comments",
    },
    {
      onClick: showNotificationModal,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isAllRead
        ? "icon-[mingcute--notification-line]"
        : "icon-[mingcute--notification-fill]",
      text: isAllRead ? "Notifications" : "Unread notifications",
    },
    {
      href: `/dashboard/${subdomain}/import`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/import`),
      icon: "icon-[mingcute--file-import-line]",
      text: "Import",
    },
    {
      href: `/dashboard/${subdomain}/events`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isEventsAllRead
        ? "icon-[mingcute--flag-4-line]"
        : "icon-[mingcute--flag-4-fill]",
      text: isEventsAllRead ? "Events" : "New Events",
    },
    {
      href: `/dashboard/${subdomain}/achievements`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "icon-[mingcute--trophy-line]",
      text: "Achievements",
    },
    {
      href: `/dashboard/${subdomain}/tokens`,
      isActive: ({ href, pathname }) => href === pathname,
      icon: "icon-[mingcute--pig-money-line]",
      text: "Tokens",
    },
    {
      href: `/dashboard/${subdomain}/settings/general`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/settings`),
      icon: "icon-[mingcute--settings-3-line]",
      text: "Settings",
    },
  ]

  return ready ? (
    hasPermission ? (
      <>
        <SEOHead title={t(title) || ""} siteName={APP_NAME} />
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
        <div className="flex h-screen">
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
                    <div className="mb-2 px-5 pt-3 pb-2 text-2xl font-extrabold flex items-center">
                      <div className="inline-block w-9 h-9 mr-3">
                        <Logo
                          type="lottie"
                          width={36}
                          height={36}
                          autoplay={false}
                        />
                      </div>
                      {"xLog"}
                    </div>
                    <div className="px-3 space-y-[2px] text-zinc-500 flex-1 min-h-0 overflow-y-auto">
                      {links.map((link) => {
                        const active =
                          link.href &&
                          link.isActive({
                            pathname: router.asPath,
                            href: link.href,
                          })
                        return (
                          <div key={link.text} onClick={() => close()}>
                            <UniLink
                              href={link.href}
                              className={cn(
                                `flex px-4 h-12 items-center rounded-md space-x-2 w-full transition-colors`,
                                active
                                  ? `bg-slate-200 font-medium text-accent`
                                  : `hover:bg-slate-200 hover:bg-opacity-50`,
                                !true && "justify-center",
                              )}
                              onClick={link.onClick}
                            >
                              <span className={cn(link.icon, "text-xl")}></span>
                              <span>{t(link.text)}</span>
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
                        <i className="icon-[mingcute--question-line] text-lg" />
                        {<span>{t("Need help?")}</span>}
                      </UniLink>
                      <UniLink
                        href={getSiteLink({
                          subdomain,
                        })}
                        className="space-x-2 border rounded-lg bg-slate-100 border-slate-200 text-accent hover:scale-105 transition-transform flex w-full h-12 items-center justify-center"
                      >
                        <span className="icon-[mingcute--home-1-line]"></span>
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
            <DashboardSidebar>
              {(isOpen) => (
                <>
                  <div className="flex-1 min-h-0 flex flex-col">
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
                    {account?.character?.handle &&
                      subdomain &&
                      account?.character?.handle !== subdomain && (
                        <div className="mb-2 px-5 pt-3 pb-2 bg-orange-50 text-center">
                          <div className="mb-2">
                            {isOpen && "You are operating"}
                          </div>
                          <Avatar
                            images={site.data?.metadata?.content?.avatars || []}
                            size={isOpen ? 60 : 40}
                            name={site.data?.metadata?.content?.name}
                          />
                          {isOpen && (
                            <span className="flex flex-col justify-center">
                              <span className="block">
                                {site.data?.metadata?.content?.name}
                              </span>
                              <span className="block text-sm text-zinc-400">
                                @{site.data?.handle}
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

                    <div className="px-3 space-y-[2px] text-zinc-500 flex-1 min-h-0 overflow-y-auto">
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
                  </div>
                  <div className="flex items-center px-4 flex-col pb-4">
                    <UniLink
                      href={DISCORD_LINK}
                      className="space-x-1 text-zinc-500 hover:text-zinc-800 flex w-full h-12 items-center justify-center transition-colors mb-2"
                    >
                      <i className="icon-[mingcute--question-line] text-lg" />
                      {isOpen && <span>{t("Need help?")}</span>}
                    </UniLink>
                    <UniLink
                      href={getSiteLink({
                        subdomain,
                      })}
                      className="space-x-2 border rounded-lg bg-slate-100 border-slate-200 text-accent hover:scale-105 transition-transform flex w-full h-12 items-center justify-center"
                    >
                      <span className="icon-[mingcute--home-1-line]"></span>
                      {isOpen && <span>{t("View Site")}</span>}
                    </UniLink>
                  </div>
                </>
              )}
            </DashboardSidebar>
          )}

          <div
            className={`${isMobileLayout ? "pt-16 flex-1" : "flex-1 min-w-0"}`}
          >
            {children}
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
    <div className="w-screen h-screen flex justify-center items-center">
      Loading...
    </div>
  )
}
