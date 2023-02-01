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
import { RSS3Icon } from "~/components/icons/RSS3Icon"
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { Image } from "~/components/ui/Image"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { RssIcon } from "@heroicons/react/24/solid"
import { XCharIcon } from "~/components/icons/XCharIcon"
import { XFeedIcon } from "~/components/icons/XFeedIcon"
import { FastAverageColor } from "fast-average-color"
import { useState } from "react"
import chroma from "chroma-js"

export type HeaderLinkType = {
  icon?: React.ReactNode
  label: string
  url?: string
  onClick?: () => void
}

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
      icon: <XCharIcon className="w-4 h-4" />,
      url: `${CSB_XCHAR}/${site?.username}`,
    },
    {
      text: "View on xFeed",
      icon: <XFeedIcon className="w-4 h-4" />,
      url: `${CSB_IO}/@${site?.username}`,
    },
    {
      text: "View on RSS3",
      icon: <RSS3Icon className="w-4 h-4 rounded" />,
      url: `https://rss3.io/result?search=${site?.username}.csb`,
    },
    {
      text: "View on Crossbell Scan",
      icon: <BlockchainIcon className="fill-[#c09526]" />,
      url: `${CSB_SCAN}/address/${site?.metadata?.owner}`,
    },
    {
      text: "JSON Feed",
      icon: <RssIcon className="w-4 h-4 text-[#ee832f]" />,
      url: `/feed`,
    },
    {
      text: "RSS",
      icon: <RssIcon className="w-4 h-4 text-[#ee832f]" />,
      url: `/feed/xml`,
    },
  ]

  const [averageColor, setAverageColor] = useState<string>()
  const fac = new FastAverageColor()
  if (site?.banners?.[0]?.address) {
    fac
      .getColorAsync(site?.banners?.[0]?.address)
      .then((color) => {
        setAverageColor(chroma(color.hex).hex())
      })
      .catch((e) => {
        console.warn(e)
      })
  } else {
    fac
      .getColorAsync(site?.avatars?.[0] || "")
      .then((color) => {
        setAverageColor(chroma(color.hex).luminance(0.95).hex())
      })
      .catch((e) => {
        console.warn(e)
      })
  }

  return (
    <header className="xlog-header border-b border-zinc-100 relative">
      <div
        className="xlog-banner absolute top-0 bottom-0 left-0 right-0 -z-10 overflow-hidden"
        style={{
          backgroundColor: averageColor,
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
                <FollowingButton
                  site={site}
                  className="text-accent mr-5 min-[438px]:mx-5"
                  variant="text"
                />
                <div className="relative inline-block align-middle h-7 group">
                  <Button
                    variant="text"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    aria-label="more"
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </Button>
                  <div className="absolute hidden right-0 sm:left-0 pt-2 group-hover:block top-full z-10 text-gray-600 w-52">
                    <div className="bg-white rounded-lg ring-1 ring-zinc-100 shadow-md py-2 text-sm">
                      {moreMenuItems.map((item) => {
                        return (
                          <UniLink
                            key={item.text}
                            href={item.url}
                            className="h-10 flex w-full space-x-2 items-center px-3 hover:bg-gray-100"
                          >
                            <span className="fill-gray-500 flex">
                              {item.icon}
                            </span>
                            <span>{item.text}</span>
                          </UniLink>
                        )
                      })}
                    </div>
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
            <ConnectButton variant="text" />
          </div>
        </div>
      </div>
    </header>
  )
}
