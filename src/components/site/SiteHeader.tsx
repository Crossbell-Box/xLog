import clsx from "clsx"
import { useRouter } from "next/router"
import { CSB_SCAN, CSB_IO, CSB_XCHAR } from "~/lib/env"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { Profile } from "~/lib/types"
import { ConnectButton } from "../common/ConnectButton"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { Image } from "~/components/ui/Image"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { RssIcon } from "@heroicons/react/24/solid"
import { XCharLogo, XFeedLogo } from "@crossbell/ui"
import { FastAverageColor } from "fast-average-color"
import { useState, useRef, useEffect, RefObject } from "react"
import chroma from "chroma-js"
import { Menu } from "~/components/ui/Menu"

export type HeaderLinkType = {
  icon?: React.ReactNode
  label: string | JSX.Element
  url?: string
  onClick?: () => void
}

const fac = new FastAverageColor()

const HeaderLink: React.FC<{ link: HeaderLinkType }> = ({ link }) => {
  const router = useRouter()
  const active = router.asPath === link.url
  return (
    <UniLink
      href={link.url}
      onClick={link.onClick}
      className={clsx(
        `xlog-site-navigation-item h-10 flex items-center space-x-1 transition-colors relative after:content-[''] hover:after:w-full hover:after:left-0 after:transition-[width,left] after:h-[2px] after:block after:absolute after:bottom-0`,
        active
          ? `text-accent after:w-full after:left-0 after:bg-accent`
          : `hover:text-gray-700 after:w-0 after:left-1/2 after:bg-gray-700`,
      )}
    >
      {link.icon && <span>{link.icon}</span>}
      <span>{link.label}</span>
    </UniLink>
  )
}

export const SiteHeader: React.FC<{
  site?: Profile | undefined | null
}> = ({ site }) => {
  const leftLinks: HeaderLinkType[] = site?.navigation?.find(
    (nav) => nav.url === "/",
  )
    ? site.navigation
    : [{ label: "Home", url: "/" }, ...(site?.navigation || [])]

  const moreMenuItems = [
    {
      text: "View on xChar",
      icon: <XCharLogo className="w-4 h-4" />,
      url: `${CSB_XCHAR}/${site?.username}`,
    },
    {
      text: "View on xFeed",
      icon: <XFeedLogo className="w-4 h-4" />,
      url: `${CSB_IO}/@${site?.username}`,
    },
    {
      text: "View on Hoot It",
      icon: (
        <div className="w-4 h-4">
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
      icon: <BlockchainIcon className="fill-[#c09526]" />,
      url: `${CSB_SCAN}/address/${site?.metadata?.owner}`,
    },
    {
      text: "JSON Feed",
      icon: (
        <div className="w-4 h-4">
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
      text: "RSS",
      icon: <RssIcon className="w-4 h-4 text-[#ee832f]" />,
      url: `/feed/xml`,
    },
  ]

  const avatarRef = useRef<HTMLImageElement>(null)
  const bannerRef = useRef<HTMLImageElement | HTMLVideoElement>(null)

  const [averageColor, setAverageColor] = useState<string>()
  const [hoverColor, setHoverColor] = useState<string>()

  useEffect(() => {
    if (bannerRef?.current) {
      fac
        .getColorAsync(bannerRef.current)
        .then((color) => {
          setAverageColor(chroma(color.hex).hex())
          setHoverColor(chroma(color.hex).luminance(0.9).hex())
        })
        .catch((e) => {
          console.warn(e)
        })
    } else if (avatarRef?.current) {
      fac
        .getColorAsync(avatarRef.current)
        .then((color) => {
          setAverageColor(chroma(color.hex).luminance(0.95).hex())
          setHoverColor(chroma(color.hex).luminance(0.9).hex())
        })
        .catch((e) => {
          console.warn(e)
        })
    }
  }, [bannerRef, avatarRef])

  return (
    <header className="xlog-header border-b border-zinc-100 relative">
      {averageColor && (
        <style jsx global>{`
          :root {
            --hover-color: ${hoverColor};
          }
        `}</style>
      )}
      <div
        className="xlog-banner absolute top-0 bottom-0 left-0 right-0 -z-10 overflow-hidden"
        style={{
          backgroundColor: averageColor
            ? `var(--banner-bg-color, ${averageColor})`
            : undefined,
        }}
      >
        {(() => {
          switch (site?.banners?.[0]?.mime_type.split("/")[0]) {
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
        <div className="flex py-10 w-full">
          <div className="xlog-site-info flex space-x-6 items-center w-full">
            {site?.avatars?.[0] && (
              <Avatar
                className="xlog-site-icon"
                images={[getUserContentsUrl(site?.avatars?.[0])]}
                size={110}
                name={site?.name}
                imageRef={avatarRef}
              />
            )}
            <div>
              <div className="xlog-site-name text-3xl font-bold text-zinc-900 leading-snug">
                {site?.name}
              </div>
              {site?.bio && (
                <div
                  className="xlog-site-description text-gray-500 text-sm leading-snug my-1"
                  dangerouslySetInnerHTML={{ __html: site?.description || "" }}
                ></div>
              )}
              <div className="xlog-site-others text-sm">
                <FollowingCount siteId={site?.username} />
                <div className="sm:inline-block">
                  <FollowingButton
                    site={site}
                    className="text-accent mr-1 sm:ml-5 sm:mr-3"
                    variant="text"
                  />
                  <div className="relative inline-block align-middle">
                    <Menu
                      target={
                        <Button variant="text" aria-label="more">
                          <EllipsisHorizontalIcon className="w-5 h-5 mx-2" />
                        </Button>
                      }
                      dropdown={
                        <div className="text-gray-600 bg-white rounded-lg ring-1 ring-zinc-100 shadow-md py-2 text-sm">
                          {moreMenuItems.map((item) => {
                            return (
                              <UniLink
                                key={item.text}
                                href={item.url}
                                className="h-10 flex w-full space-x-2 items-center px-3 hover:bg-hover"
                              >
                                <span className="fill-gray-500 flex">
                                  {item.icon}
                                </span>
                                <span>{item.text}</span>
                              </UniLink>
                            )
                          })}
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400 flex items-center justify-between w-full mt-auto">
          <div className="xlog-site-navigation flex items-center space-x-5 min-w-0 overflow-x-auto">
            {leftLinks.map((link, i) => {
              return <HeaderLink link={link} key={`${link.label}${i}`} />
            })}
          </div>
          <div className="mb-[2px] pl-1">
            <ConnectButton variant="text" mobileSimplification={true} />
          </div>
        </div>
      </div>
    </header>
  )
}
