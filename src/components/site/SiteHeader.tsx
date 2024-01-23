import NextImage from "next/image"

import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { PatronButton } from "~/components/common/PatronButton"
import { Tabs, type TabItem } from "~/components/ui/Tabs"
import getQueryClient from "~/lib/query-client"
import { cn } from "~/lib/utils"
import { fetchGetSite } from "~/queries/site.server"

import { ConnectButton } from "../common/ConnectButton"
import { Avatar } from "../ui/Avatar"
import ConnectedAccounts from "./ConnectedAccounts"
import { SiteHeaderMenu } from "./SiteHeaderMenu"

export const SiteHeader = async ({
  handle,
  hideNavigation,
  hideSearch,
}: {
  handle: string
  full?: boolean
  hideNavigation?: boolean
  hideSearch?: boolean
}) => {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(handle, queryClient)
  const leftLinks: TabItem[] = (
    site?.metadata?.content?.navigation?.find((nav) => nav.url === "/")
      ? site.metadata?.content?.navigation
      : [
          { label: "Home", url: "/" },
          ...(site?.metadata?.content?.navigation || []),
        ]
  ).map((tab) => ({
    text: tab.label,
    href: tab.url,
  }))

  return (
    <header className="xlog-header border-b border-zinc-100 relative">
      <div className="xlog-banner absolute inset-0 overflow-hidden">
        {(() => {
          switch (
            site?.metadata?.content?.banners?.[0]?.mime_type?.split("/")[0]
          ) {
            case "image":
              return (
                <NextImage
                  className="object-cover"
                  src={site?.metadata?.content?.banners?.[0]?.address}
                  alt="banner"
                  fill
                  priority={true}
                />
              )
            case "video":
              return (
                <video
                  className="object-cover size-full"
                  src={site?.metadata?.content?.banners?.[0]?.address}
                  autoPlay
                  muted
                  playsInline
                  crossOrigin="anonymous"
                />
              )
            default:
              return null
          }
        })()}
      </div>
      <div
        className={cn(
          "px-5 max-w-screen-lg mx-auto h-full relative flex items-center flex-col z-10",
          site?.metadata?.content?.banners?.[0]?.address
            ? "bg-white/50 backdrop-blur-sm sm:bg-transparent sm:backdrop-filter-none"
            : "",
        )}
      >
        <div className="mb-auto"></div>
        <div className="flex py-12 w-full">
          <div
            className={cn(
              "xlog-site-info flex space-x-6 sm:space-x-8 w-full",
              site?.metadata?.content?.banners?.[0]?.address
                ? "sm:bg-white/50 sm:backdrop-blur-sm sm:rounded-3xl z-[1] sm:p-8 sm:border"
                : "",
            )}
          >
            <Avatar
              cid={site?.characterId}
              className="xlog-site-icon max-w-[100px] max-h-[100px] sm:max-w-none sm:max-h-none"
              images={site?.metadata?.content?.avatars || []}
              size={150}
              name={site?.metadata?.content?.name}
              priority={true}
            />
            <div className="flex-1 min-w-0 relative space-y-2 sm:space-y-3 min-h-[108px]">
              <div className="flex items-center justify-between">
                <h1 className="xlog-site-name text-3xl sm:text-4xl font-bold text-zinc-900 leading-snug break-words min-w-0">
                  {site?.metadata?.content?.site_name ||
                    site?.metadata?.content?.name}
                </h1>
                <div className="ml-0 sm:ml-8 space-x-3 sm:space-x-4 flex items-center sm:static absolute -bottom-9 right-0">
                  <SiteHeaderMenu
                    handle={site?.handle}
                    owner={site?.owner}
                    hideSearch={hideSearch}
                  />
                  <div className="xlog-site-follow-button">
                    <FollowingButton site={site || undefined} />
                  </div>
                </div>
              </div>
              {site?.metadata?.content?.bio && (
                <div className="xlog-site-description text-gray-500 leading-snug text-sm sm:text-base line-clamp-4 whitespace-pre-wrap">
                  {site?.metadata?.content?.bio}
                </div>
              )}
              <div className="flex space-x-0 sm:space-x-3 flex-col sm:flex-row text-sm sm:text-base">
                <span className="xlog-site-follow-count block sm:inline-block whitespace-nowrap absolute -bottom-9 sm:static">
                  <FollowingCount characterId={site?.characterId} />
                </span>
                <span className="xlog-site-patron absolute -bottom-9 right-[calc(100%+50px)] sm:static">
                  <PatronButton site={site || undefined} />
                </span>
              </div>
              <ConnectedAccounts
                className="!mb-4 sm:!mb-0"
                connectedAccounts={site?.metadata?.content?.connected_accounts}
              />
            </div>
          </div>
        </div>
        {!hideNavigation && (
          <div className="text-gray-500 flex items-center justify-between w-full mt-auto">
            <Tabs
              items={leftLinks}
              className="xlog-site-navigation border-none mb-0"
            />
            <div className="xlog-site-connect pl-1">
              <ConnectButton variant="text" mobileSimplification={true} />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
