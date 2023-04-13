import { cn } from "~/lib/utils"
import { useRouter } from "next/router"
import { CSB_SCAN, CSB_IO, CSB_XCHAR } from "~/lib/env"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { Profile } from "~/lib/types"
import { ConnectButton } from "../common/ConnectButton"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Image } from "~/components/ui/Image"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { RssIcon } from "@heroicons/react/24/solid"
import { XCharLogo, XFeedLogo } from "@crossbell/ui"
import { FastAverageColor } from "fast-average-color"
import { useState, useRef, useEffect, RefObject } from "react"
import chroma from "chroma-js"
import { Menu } from "~/components/ui/Menu"
import { useTranslation } from "next-i18next"
import { Tooltip } from "~/components/ui/Tooltip"
import { PatronButton } from "~/components/common/PatronButton"
import { Modal } from "~/components/ui/Modal"
import { SearchInput } from "~/components/common/SearchInput"
import { useMediaStore } from "~/hooks/useDarkMode"

type HeaderLinkType = {
  icon?: React.ReactNode
  label: string
  url?: string
  onClick?: () => void
}

const fac = new FastAverageColor()

const HeaderLink: React.FC<{ link: HeaderLinkType }> = ({ link }) => {
  const router = useRouter()
  const { t } = useTranslation("site")
  const active = router.asPath === link.url
  return (
    <UniLink
      href={link.url}
      onClick={link.onClick}
      className={cn(
        `xlog-site-navigation-item h-10 flex items-center space-x-1 transition-colors relative after:content-[''] hover:after:w-full hover:after:left-0 after:transition-[width,left] after:h-[2px] after:block after:absolute after:bottom-0`,
        active
          ? `text-accent after:w-full after:left-0 after:bg-accent`
          : `hover:text-gray-700 after:w-0 after:left-1/2 after:bg-gray-700`,
      )}
    >
      {link.icon && <span>{link.icon}</span>}
      <span className="whitespace-nowrap">{t(link.label)}</span>
    </UniLink>
  )
}

export const SiteHeader: React.FC<{
  site?: Profile | undefined | null
}> = ({ site }) => {
  const { t } = useTranslation("site")
  const leftLinks: HeaderLinkType[] = site?.navigation?.find(
    (nav) => nav.url === "/",
  )
    ? site.navigation
    : [{ label: "Home", url: "/" }, ...(site?.navigation || [])]

  const moreMenuItems = [
    {
      text: "View on xChar",
      icon: <XCharLogo className="w-full h-full" />,
      url: `${CSB_XCHAR}/${site?.username}`,
    },
    {
      text: "View on xFeed",
      icon: <XFeedLogo className="w-full h-full" />,
      url: `${CSB_IO}/@${site?.username}`,
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
      url: `https://hoot.it/search/${site?.username}.csb/activities`,
    },
    {
      text: "View on Crossbell Scan",
      icon: <BlockchainIcon className="fill-[#c09526] w-full h-full" />,
      url: `${CSB_SCAN}/address/${site?.metadata?.owner}`,
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
      url: `/feed/xml`,
      out: true,
    },
    {
      text: "Search on this site",
      icon: (
        <span className="text-stone-400">
          <i className="i-mingcute:search-line block" />
        </span>
      ),
      onClick: () => setSearchOpen(true),
      out: true,
    },
  ]

  const [searchOpen, setSearchOpen] = useState(false)

  const avatarRef = useRef<HTMLImageElement>(null)
  const bannerRef = useRef<HTMLImageElement | HTMLVideoElement>(null)

  const isDark = useMediaStore((state) => state.isDark)
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
          switch (site?.banners?.[0]?.mime_type?.split("/")[0]) {
            case "image":
              return (
                <Image
                  className="max-w-screen-md mx-auto object-cover"
                  src={site?.banners?.[0]?.address}
                  alt="banner"
                  fill
                  imageRef={bannerRef as RefObject<HTMLImageElement>}
                />
              )
            case "video":
              return (
                <video
                  className="max-w-screen-md mx-auto object-cover h-full w-full"
                  src={site?.banners?.[0]?.address}
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
              site?.banners?.[0]?.address
                ? "bg-white bg-opacity-50 backdrop-blur-sm rounded-xl p-4 sm:p-8 z-[1] border"
                : "",
            )}
          >
            {site?.avatars?.[0] && (
              <Avatar
                className="xlog-site-icon max-w-[80px] max-h-[80px] sm:max-w-none sm:max-h-none"
                images={[getUserContentsUrl(site?.avatars?.[0])]}
                size={120}
                name={site?.name}
                imageRef={avatarRef}
              />
            )}
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-center justify-between">
                <div className="xlog-site-name text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug break-words min-w-0">
                  {site?.name}
                </div>
                <div className="ml-0 sm:ml-8 space-x-3 sm:space-x-4 flex items-center sm:static absolute -bottom-0 right-0">
                  <div className="xlog-site-more-menu relative inline-block align-middle">
                    <Menu
                      target={
                        <Button
                          variant="text"
                          aria-label="more"
                          className="-mx-2 text-zinc-600"
                        >
                          <i className="i-mingcute:more-1-line text-2xl" />
                        </Button>
                      }
                      dropdown={
                        <div className="text-gray-600 bg-white rounded-lg ring-1 ring-border shadow-md py-2 text-sm">
                          {moreMenuItems.map((item) => {
                            return (
                              <UniLink
                                key={item.text}
                                href={item.url}
                                onClick={item.onClick}
                                className="h-10 flex w-full space-x-2 items-center px-3 hover:bg-hover"
                              >
                                <span className="fill-gray-500 flex items-center w-4 h-4 text-base leading-none">
                                  {item.icon}
                                </span>
                                <span>{t(item.text)}</span>
                              </UniLink>
                            )
                          })}
                        </div>
                      }
                    />
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
                    <FollowingButton site={site} />
                  </div>
                </div>
              </div>
              {site?.bio && (
                <div
                  className="xlog-site-description text-gray-500 leading-snug my-2 sm:my-3 text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: site?.description || "" }}
                ></div>
              )}
              <div className="flex space-x-0 sm:space-x-5 space-y-2 sm:space-y-0 flex-col sm:flex-row text-sm sm:text-base">
                <span className="xlog-site-follow-count block sm:inline-block whitespace-nowrap">
                  <FollowingCount siteId={site?.username} />
                </span>
                <span className="xlog-site-patron">
                  <PatronButton site={site} />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-gray-500 flex items-center justify-between w-full mt-auto">
          <div className="xlog-site-navigation flex items-center space-x-5 min-w-0 overflow-x-auto text-sm sm:text-base">
            {leftLinks.map((link, i) => {
              return <HeaderLink link={link} key={`${link.label}${i}`} />
            })}
          </div>
          <div className="pl-1">
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
