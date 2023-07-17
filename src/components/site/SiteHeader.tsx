import NextImage from "next/image"

import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { PatronButton } from "~/components/common/PatronButton"
import getQueryClient from "~/lib/query-client"
import { cn } from "~/lib/utils"
import { fetchGetSite } from "~/queries/site.server"

import { ConnectButton } from "../common/ConnectButton"
import { Avatar } from "../ui/Avatar"
import { HeaderLink, type HeaderLinkType } from "./SiteHeaderLink"
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
  const leftLinks: HeaderLinkType[] = site?.metadata?.content?.navigation?.find(
    (nav) => nav.url === "/",
  )
    ? site.metadata?.content?.navigation
    : [
        { label: "Home", url: "/" },
        ...(site?.metadata?.content?.navigation || []),
      ]

  return (
    <header className="xlog-header border-b border-zinc-100 relative">
      <div className="xlog-banner absolute top-0 bottom-0 left-0 right-0 -z-10 overflow-hidden">
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
                  className="object-cover h-full w-full"
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
      <div className="px-5 max-w-screen-md mx-auto h-full relative flex items-center flex-col">
        <div className="mb-auto"></div>
        <div className="flex py-12 w-full">
          <div
            className={cn(
              "xlog-site-info flex space-x-6 sm:space-x-8 items-center w-full",
              site?.metadata?.content?.banners?.[0]?.address
                ? "bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-4 sm:p-8 z-[1] border"
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
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-center justify-between">
                <h1 className="xlog-site-name text-3xl sm:text-4xl font-bold text-zinc-900 leading-snug break-words min-w-0">
                  {site?.metadata?.content?.site_name ||
                    site?.metadata?.content?.name}
                </h1>
                <div className="ml-0 sm:ml-8 space-x-3 sm:space-x-4 flex items-center sm:static absolute -bottom-0 right-0">
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
                <div className="xlog-site-description text-gray-500 leading-snug my-2 sm:my-3 text-sm sm:text-base line-clamp-4 whitespace-pre-wrap">
                  {site?.metadata?.content?.bio}
                </div>
              )}
              <div className="flex space-x-0 sm:space-x-5 space-y-2 sm:space-y-0 flex-col sm:flex-row text-sm sm:text-base">
                <span className="xlog-site-follow-count block sm:inline-block whitespace-nowrap">
                  <FollowingCount characterId={site?.characterId} />
                </span>
                <span className="xlog-site-patron">
                  <PatronButton site={site || undefined} />
                </span>
              </div>
            </div>
          </div>
        </div>
        {!hideNavigation && (
          <div className="text-gray-500 flex items-center justify-between w-full mt-auto">
            <div className="xlog-site-navigation flex items-center gap-1 mx-[-.5rem] min-w-0 text-sm sm:text-base overflow-x-auto">
              {leftLinks.map((link, i) => {
                return <HeaderLink link={link} key={`${link.label}${i}`} />
              })}
            </div>
            <div className="xlog-site-connect pl-1">
              <ConnectButton variant="text" mobileSimplification={true} />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
