import clsx from "clsx"
import { useRouter } from "next/router"
import { CSB_SCAN, CSB_IO } from "~/lib/env"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { Profile } from "~/lib/types"
import { ConnectButton } from "../common/ConnectButton"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { RSS3Icon } from "~/components/icons/RSS3Icon"
import { EllipsisHorizontalIcon, RssIcon } from "@heroicons/react/20/solid"
import { Image } from "~/components/ui/Image"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"

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
        `xlog-site-navigation-item h-10 flex items-center border-b-2 space-x-1 hover:border-gray-500 hover:text-gray-700 transition-colors`,
        active ? `text-accent border-accent` : `border-transparent`,
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
      text: "View on Crossbell.io",
      icon: <span className="i-bxs:bell inline-block"></span>,
      url: CSB_IO && `${CSB_IO}/@${site?.username}`,
    },
    {
      text: "View on RSS3",
      icon: <RSS3Icon />,
      url: `https://rss3.io/result?search=${site?.username}.csb`,
    },
    {
      text: "View on blockchain explorer",
      icon: <BlockchainIcon />,
      url: `${CSB_SCAN}/address/${site?.metadata?.owner}/transactions`,
    },
    {
      text: "JSON Feed",
      icon: <RssIcon className="w-4 h-4" />,
      url: `/feed`,
    },
    {
      text: "RSS",
      icon: <RssIcon className="w-4 h-4" />,
      url: `/feed/xml`,
    },
  ]

  return (
    <header className="xlog-header border-b border-zinc-100 relative">
      <div className="xlog-banner absolute top-0 bottom-0 left-0 right-0 -z-10 overflow-hidden">
        {site?.banners?.[0]?.mime_type.split("/")[0] === "image" && (
          <Image
            className="max-w-screen-md mx-auto object-cover"
            src={site?.banners?.[0]?.address}
            alt="banner"
            fill
          />
        )}
        {site?.banners?.[0]?.mime_type.split("/")[0] === "video" && (
          <video
            className="max-w-screen-md mx-auto object-cover h-full w-full"
            src={site?.banners?.[0]?.address}
            autoPlay
            muted
            playsInline
          />
        )}
      </div>
      <div className="px-5 max-w-screen-md mx-auto h-full relative flex items-center flex-col">
        <div className="mb-auto"></div>
        <div className="flex py-10 w-full">
          <div className="xlog-site-info flex space-x-6 items-center w-full">
            {site?.avatars?.[0] && (
              <Avatar
                className="xlog-site-icon"
                images={[getUserContentsUrl(site?.avatars?.[0])]}
                size={100}
                name={site?.name}
              />
            )}
            <div>
              <div className="xlog-site-name text-2xl font-bold text-zinc-900">
                {site?.name}
              </div>
              {site?.bio && (
                <div
                  className="xlog-site-description text-gray-500 text-xs leading-8"
                  dangerouslySetInnerHTML={{ __html: site?.description || "" }}
                ></div>
              )}
              <div className="xlog-site-others text-sm">
                <FollowingCount siteId={site?.username} />
                <FollowingButton
                  siteId={site?.username}
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
                  <div className="absolute hidden right-0 sm:left-0 pt-2 group-hover:block top-full z-10 text-gray-600 w-60">
                    <div className="bg-white rounded-lg ring-1 ring-zinc-100 min-w-[140px] shadow-md py-2 text-sm">
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
          <div className="xlog-site-navigation flex items-center space-x-5">
            {leftLinks.map((link, i) => {
              return <HeaderLink link={link} key={`${link.label}${i}`} />
            })}
          </div>
          <ConnectButton variant="text" />
        </div>
      </div>
    </header>
  )
}
