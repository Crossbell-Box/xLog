import clsx from "clsx"
import { useRouter } from "next/router"
import React, { useEffect } from "react"

import { APP_NAME } from "~/lib/env"
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
      onClick: showNotificationModal,
      isActive: ({ href, pathname }) => href === pathname,
      icon: isAllRead ? "i-bi:bell" : "i-bi:bell-fill",
      text: isAllRead ? "Notifications" : "Unread notifications",
    },
    {
      href: `/dashboard/${subdomain}/settings/general`,
      isActive: ({ pathname }) =>
        pathname.startsWith(`/dashboard/${subdomain}/settings`),
      icon: "i-bi-gear",
      text: "Settings",
    },
  ]

  return ready ? (
    hasPermission ? (
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
        <div className="flex h-screen">
          <DashboardSidebar>
            {(isOpen) => (
              <>
                {userSite.data?.[0]?.username &&
                  subdomain &&
                  userSite.data[0].username !== subdomain && (
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
                        className={clsx(
                          `flex px-4 h-12 items-center rounded-md space-x-2 w-full transition-colors`,
                          active
                            ? `bg-slate-200 font-medium text-slate-800`
                            : `hover:bg-slate-200 hover:bg-opacity-50`,
                          !isOpen && "justify-center",
                        )}
                        onClick={link.onClick}
                      >
                        <span className={clsx(link.icon, "text-lg")}></span>
                        {isOpen && <span>{t(link.text)}</span>}
                      </UniLink>
                    )
                  })}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center px-4">
                  <UniLink
                    href={getSiteLink({
                      subdomain,
                    })}
                    className="space-x-2 border rounded-lg bg-slate-100 border-slate-200 text-slate-500 hover:text-accent flex w-full h-12 items-center justify-center transition-colors"
                  >
                    <span className="i-bi:box-arrow-up-right"></span>
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
      </div>
    )
  ) : (
    <div className="w-screen h-screen flex justify-center items-center">
      Loading...
    </div>
  )
}
