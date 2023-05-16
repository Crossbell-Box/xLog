"use client"

import chroma from "chroma-js"
import { FastAverageColor } from "fast-average-color"
import { usePathname } from "next/navigation"
import { MutableRefObject, RefObject, useEffect, useRef, useState } from "react"

import { XCharLogo, XFeedLogo } from "@crossbell/ui"
import { RssIcon } from "@heroicons/react/24/solid"

import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { PatronButton } from "~/components/common/PatronButton"
import { SearchInput } from "~/components/common/SearchInput"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Image } from "~/components/ui/Image"
import { Modal } from "~/components/ui/Modal"
import { Tooltip } from "~/components/ui/Tooltip"
import { useIsDark } from "~/hooks/useDarkMode"
import { CSB_IO, CSB_SCAN, CSB_XCHAR } from "~/lib/env"
import { useTranslation } from "~/lib/i18n/client"
import { cn } from "~/lib/utils"
import { useGetSite } from "~/queries/site"

import { ConnectButton } from "../common/ConnectButton"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { Menu } from "../ui/Menu"
import { UniLink } from "../ui/UniLink"

type HeaderLinkType = {
  icon?: React.ReactNode
  label: string
  url?: string
  onClick?: () => void
}

const fac = new FastAverageColor()

const HeaderLink: React.FC<{ link: HeaderLinkType }> = ({ link }) => {
  const pathname = usePathname()
  const { t } = useTranslation("site")

  const active = pathname === link.url
  return (
    <UniLink
      href={link.url}
      onClick={link.onClick}
      className={cn("xlog-site-navigation-item", {
        "xlog-site-navigation-item-active": active,
      })}
    >
      {link.icon && <span>{link.icon}</span>}
      <span className="whitespace-nowrap">{t(link.label)}</span>
    </UniLink>
  )
}

export const SiteHeader: React.FC<{
  handle: string
}> = ({ handle }) => {
  const site = useGetSite(handle)
  const { t } = useTranslation("site")
  const leftLinks: HeaderLinkType[] =
    site.data?.metadata?.content?.navigation?.find((nav) => nav.url === "/")
      ? site.data.metadata?.content?.navigation
      : [
          { label: "Home", url: "/" },
          ...(site.data?.metadata?.content?.navigation || []),
        ]

  const moreMenuItems = [
    {
      text: "View on xChar",
      icon: <XCharLogo className="w-full h-full" />,
      url: `${CSB_XCHAR}/${site.data?.handle}`,
    },
    {
      text: "View on xFeed",
      icon: <XFeedLogo className="w-full h-full" />,
      url: `${CSB_IO}/@${site.data?.handle}`,
    },
    {
      text: "View on Hoot It",
      icon: (
        <div className="w-full h-full">
          <Image
            alt="Hoot It"
            src="/assets/hoot.svg"
            className="rounded"
            width={16}
            height={16}
          />
        </div>
      ),
      url: `https://hoot.it/search/${site.data?.handle}.csb/activities`,
    },
    {
      text: "View on Crossbell Scan",
      icon: <BlockchainIcon className="fill-[#c09526] w-full h-full" />,
      url: `${CSB_SCAN}/address/${site.data?.owner}`,
    },
    {
      text: "Subscribe to JSON Feed",
      icon: (
        <div className="w-full h-full">
          <Image
            alt="JSON Feed"
            src="/assets/json-feed.png"
            className="rounded"
            width={16}
            height={16}
          />
        </div>
      ),
      url: `/feed`,
    },
    {
      text: "Subscribe to RSS",
      icon: <RssIcon className="w-full h-full text-[#ee832f]" />,
      url: `/feed?format=xml`,
      out: true,
    },
    {
      text: "Search on this site",
      icon: (
        <span className="text-stone-400">
          <i className="icon-[mingcute--search-line] block" />
        </span>
      ),
      onClick: () => setSearchOpen(true),
      out: true,
    },
  ]

  const [searchOpen, setSearchOpen] = useState(false)

  const avatarRef = useRef<HTMLImageElement>(null)
  const bannerRef = useRef<HTMLImageElement | HTMLVideoElement>(null)

  const isDark = useIsDark()
  const [averageColor, setAverageColor] = useState<string>()
  const [autoHoverColor, setAutoHoverColor] = useState<string>()
  const [autoThemeColor, setAutoThemeColor] = useState<string>()

  useEffect(() => {
    if (bannerRef?.current) {
      fac
        .getColorAsync(bannerRef.current)
        .then((color) => {
          if (isDark) {
            setAverageColor(chroma(color.hex).luminance(0.007).hex())
            setAutoHoverColor(chroma(color.hex).luminance(0.02).hex())
          } else {
            setAverageColor(chroma(color.hex).hex())
            setAutoHoverColor(chroma(color.hex).luminance(0.8).hex())
          }
          setAutoThemeColor(chroma(color.hex).saturate(3).luminance(0.3).hex())
        })
        .catch((e) => {
          console.warn(e)
        })
    } else if (avatarRef?.current) {
      fac
        .getColorAsync(avatarRef.current)
        .then((color) => {
          if (isDark) {
            setAverageColor(chroma(color.hex).luminance(0.007).hex())
            setAutoHoverColor(chroma(color.hex).luminance(0.02).hex())
          } else {
            setAverageColor(chroma(color.hex).luminance(0.95).hex())
            setAutoHoverColor(chroma(color.hex).luminance(0.8).hex())
          }
          setAutoThemeColor(chroma(color.hex).saturate(3).luminance(0.3).hex())
        })
        .catch((e) => {
          console.warn(e)
        })
    }
  }, [bannerRef, avatarRef, isDark])

  return (
    <header className="xlog-header border-b border-zinc-100 relative">
      {averageColor && (
        <style jsx global>{`
          :root {
            --auto-hover-color: ${autoHoverColor};
            --auto-theme-color: ${autoThemeColor};
          }
        `}</style>
      )}
      <div
        className="xlog-banner absolute top-0 bottom-0 left-0 right-0 -z-10 overflow-hidden"
        style={{
          backgroundColor: averageColor
            ? `var(--banner-bg-color, ${averageColor})`
            : "var(--banner-bg-color)",
        }}
      >
        {(() => {
          switch (
            site.data?.metadata?.content?.banners?.[0]?.mime_type?.split("/")[0]
          ) {
            case "image":
              return (
                <Image
                  className="max-w-screen-md mx-auto object-cover"
                  src={site.data?.metadata?.content?.banners?.[0]?.address}
                  alt="banner"
                  fill
                  imageRef={bannerRef as MutableRefObject<HTMLImageElement>}
                />
              )
            case "video":
              return (
                <video
                  className="max-w-screen-md mx-auto object-cover h-full w-full"
                  src={site.data?.metadata?.content?.banners?.[0]?.address}
                  autoPlay
                  muted
                  playsInline
                  ref={bannerRef as RefObject<HTMLVideoElement>}
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
              "xlog-site-info flex space-x-6 items-center w-full",
              site.data?.metadata?.content?.banners?.[0]?.address
                ? "bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-4 sm:p-8 z-[1] border"
                : "",
            )}
          >
            {site.data?.metadata?.content?.avatars?.[0] && (
              <Avatar
                className="xlog-site-icon max-w-[80px] max-h-[80px] sm:max-w-none sm:max-h-none"
                images={site.data?.metadata?.content?.avatars}
                size={120}
                name={site.data?.metadata?.content?.name}
                imageRef={avatarRef as MutableRefObject<HTMLImageElement>}
              />
            )}
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-center justify-between">
                <h1 className="xlog-site-name text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug break-words min-w-0">
                  {site.data?.metadata?.content?.site_name ||
                    site.data?.metadata?.content?.name}
                </h1>
                <div className="ml-0 sm:ml-8 space-x-3 sm:space-x-4 flex items-center sm:static absolute -bottom-0 right-0">
                  <div className="xlog-site-more-menu relative inline-block align-middle">
                    <MoreActions>
                      {moreMenuItems.map((item) => (
                        <MoreActions.Item
                          key={item.text}
                          icon={item.icon}
                          {...(item.onClick
                            ? {
                                type: "button",
                                onClick: item.onClick,
                              }
                            : {
                                type: "link",
                                href: item.url,
                              })}
                        >
                          {t(item.text)}
                        </MoreActions.Item>
                      ))}
                    </MoreActions>
                  </div>
                  <div className="xlog-site-more-out hidden sm:block">
                    <div className="-mx-2 flex">
                      {moreMenuItems.map((item) => {
                        if (item.out) {
                          return (
                            <Tooltip
                              label={t(item.text)}
                              key={item.text}
                              placement="bottom"
                            >
                              <Button
                                variant="text"
                                aria-label={item.text}
                                onClick={() =>
                                  item.url
                                    ? window.open(item.url, "_blank")
                                    : item.onClick?.()
                                }
                              >
                                <span className="fill-gray-500 flex w-6 h-6 text-2xl">
                                  {item.icon}
                                </span>
                              </Button>
                            </Tooltip>
                          )
                        } else {
                          return null
                        }
                      })}
                    </div>
                  </div>
                  <div className="xlog-site-follow-button">
                    <FollowingButton site={site.data || undefined} />
                  </div>
                </div>
              </div>
              {site.data?.metadata?.content?.bio && (
                <div className="xlog-site-description text-gray-500 leading-snug my-2 sm:my-3 text-sm sm:text-base line-clamp-4 whitespace-pre-wrap">
                  {site.data?.metadata?.content?.bio}
                </div>
              )}
              <div className="flex space-x-0 sm:space-x-5 space-y-2 sm:space-y-0 flex-col sm:flex-row text-sm sm:text-base">
                <span className="xlog-site-follow-count block sm:inline-block whitespace-nowrap">
                  <FollowingCount characterId={site.data?.characterId} />
                </span>
                <span className="xlog-site-patron">
                  <PatronButton site={site.data || undefined} />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-gray-500 flex items-center justify-between w-full mt-auto">
          <div className="xlog-site-navigation flex items-center gap-1 mx-[-.5rem] min-w-0 text-sm sm:text-base">
            {leftLinks.map((link, i) => {
              return <HeaderLink link={link} key={`${link.label}${i}`} />
            })}
          </div>
          <div className="xlog-site-connect pl-1">
            <ConnectButton variant="text" mobileSimplification={true} />
          </div>
        </div>
      </div>
      <Modal open={searchOpen} setOpen={setSearchOpen}>
        <div className="p-3">
          <SearchInput noBorder={true} onSubmit={() => setSearchOpen(false)} />
        </div>
      </Modal>
    </header>
  )
}

function MoreActions({ children }: React.PropsWithChildren<{}>) {
  return (
    <Menu
      target={
        <Button
          variant="text"
          aria-label="more"
          className="-mx-2 text-zinc-600"
        >
          <i className="icon-[mingcute--more-1-line] text-2xl" />
        </Button>
      }
      dropdown={<div className="text-sm">{children}</div>}
    />
  )
}

MoreActions.Item = Menu.Item
