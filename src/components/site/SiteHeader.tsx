import clsx from "clsx"
import { useRouter } from "next/router"
import { IS_PROD } from "~/lib/constants"
import { SITE_URL, CSB_SCAN, CSB_IO } from "~/lib/env"
import { useStore } from "~/lib/store"
import { Viewer } from "~/lib/types"
import { getUserContentsUrl } from "~/lib/user-contents"
import { truthy } from "~/lib/utils"
import { DashboardIcon } from "../icons/DashboardIcon"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { Profile } from "~/lib/types"
import { ConnectButton } from "../common/ConnectButton"
import { useAccount } from "wagmi"
import unidata from "~/lib/unidata"
import { Fragment, useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  useGetSubscription,
  useGetSiteSubscriptions,
  useSubscribeToSite,
  useUnsubscribeFromSite,
  useGetUserSites,
} from "~/queries/site"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { DotsHorizontalIcon, RssIcon } from "@heroicons/react/solid"
import { Modal } from "~/components/ui/Modal"

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
        `h-10 flex items-center border-b-2 space-x-1 hover:border-gray-500 hover:text-gray-700`,
        active ? `text-theme-color border-accent` : `border-transparent`,
      )}
    >
      {link.icon && <span>{link.icon}</span>}
      <span>{link.label}</span>
    </UniLink>
  )
}

export const SiteHeader: React.FC<{
  site?: Profile | undefined
}> = ({ site }) => {
  const { address } = useAccount()
  const subscribeToSite = useSubscribeToSite()
  const unsubscribeFromSite = useUnsubscribeFromSite()
  const { openConnectModal } = useConnectModal()
  const [followProgress, setFollowProgress] = useState<boolean>(false)
  const userSite = useGetUserSites(address)
  const router = useRouter()
  let [isFollowListOpen, setIsFollowListOpen] = useState(false)

  const handleClickSubscribe = async () => {
    if (!address) {
      setFollowProgress(true)
      openConnectModal?.()
    } else if (!userSite.data) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else if (site?.username) {
      if (subscription.data) {
        unsubscribeFromSite.mutate({
          userId: address,
          siteId: site.username,
        })
      } else {
        subscribeToSite.mutate({
          userId: address,
          siteId: site.username,
        })
      }
    }
  }

  const subscription = useGetSubscription({
    userId: address || "",
    siteId: site?.username || "",
  })

  const siteSubscriptions = useGetSiteSubscriptions({
    siteId: site?.username || "",
  })

  useEffect(() => {
    if (
      followProgress &&
      address &&
      subscription.isSuccess &&
      site?.username &&
      userSite.isSuccess
    ) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      if (!subscription.data) {
        subscribeToSite.mutate({
          userId: address,
          siteId: site.username,
        })
      }
      setFollowProgress(false)
    }
  }, [
    userSite.isSuccess,
    userSite.data,
    router,
    followProgress,
    address,
    subscription.isSuccess,
    subscription.data,
    site?.username,
    subscribeToSite,
  ])

  useEffect(() => {
    if (subscribeToSite.isError || subscribeToSite.data?.code) {
      toast.error(
        "Failed to follow: " +
          (subscribeToSite.data?.message ||
            (subscribeToSite.error as any)?.message),
      )
      subscribeToSite.reset()
    }
  }, [subscribeToSite.isError, subscribeToSite.data?.code])

  const leftLinks: HeaderLinkType[] = [
    { label: "Home", url: "/" },
    ...(site?.navigation || []),
  ]

  const moreMenuItems = [
    {
      text: "View on Crossbell.io",
      icon: <span className="i-bxs:bell inline-block"></span>,
      url: CSB_IO && `${CSB_IO}/@${site?.username}`,
    },
    {
      text: "View on RSS3",
      icon: <RssIcon className="w-4 h-4" />,
      url: `https://rss3.io/result?search=${site?.metadata?.owner}`,
    },
    {
      text: "View on blockchain explorer",
      icon: <BlockchainIcon />,
      url: `${CSB_SCAN}/address/${site?.metadata?.owner}/transactions`,
    },
  ]

  return (
    <header className="border-b">
      <div className="px-5 max-w-screen-md mx-auto">
        <div className="flex py-10">
          <div className="xlog-site-info flex space-x-6 items-center">
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
                  className="xlog-site-description text-gray-500 text-xs mt-1"
                  dangerouslySetInnerHTML={{ __html: site?.description || "" }}
                ></div>
              )}
              <div className="mt-3 text-sm">
                {siteSubscriptions.data ? (
                  <span
                    className="xlog-site-followers align-middle text-zinc-500 text-sm cursor-pointer"
                    onClick={() => setIsFollowListOpen(true)}
                  >
                    <span className="font-bold text-zinc-700">
                      {siteSubscriptions.data.total}
                    </span>{" "}
                    Followers
                  </span>
                ) : (
                  ""
                )}
                <Button
                  variant="text"
                  onClick={handleClickSubscribe}
                  className="space-x-1 group align-middle text-theme-color mx-5"
                  isLoading={
                    subscription.data
                      ? unsubscribeFromSite.isLoading ||
                        subscribeToSite.isLoading
                      : userSite.isLoading ||
                        unsubscribeFromSite.isLoading ||
                        subscribeToSite.isLoading ||
                        subscription.isLoading
                  }
                >
                  <span className="i-bxs:bell"></span>
                  {subscription.data ? (
                    <>
                      <span className="pr-1 group-hover:hidden w-16">
                        Following
                      </span>
                      <span className="pr-1 hidden group-hover:block w-16">
                        Unfollow
                      </span>
                    </>
                  ) : (
                    <span className="pr-1">Follow</span>
                  )}
                </Button>
                <div className="relative inline-block align-middle h-7 group">
                  <Button
                    variant="text"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <DotsHorizontalIcon className="w-5 h-5" />
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
        <div className="text-sm text-gray-400 flex items-center justify-between">
          <div className="xlog-site-navigation flex items-center space-x-5">
            {leftLinks.map((link, i) => {
              return <HeaderLink link={link} key={`${link.label}${i}`} />
            })}
          </div>
          <ConnectButton variant="text" />
        </div>
      </div>
      <Modal
        open={isFollowListOpen}
        setOpen={setIsFollowListOpen}
        title="Follow List"
      >
        <ul className="px-5">
          {siteSubscriptions.data?.list?.map((sub: any, index) => (
            <li
              className="py-3 flex items-center space-x-2 text-sm"
              key={index}
            >
              <UniLink
                href={CSB_IO && `${CSB_IO}/@${sub?.character?.handle}`}
                className="flex items-center space-x-2 text-sm"
              >
                <Avatar
                  className="align-middle border-2 border-white"
                  images={sub.character?.metadata?.content?.avatars || []}
                  name={
                    sub.character?.metadata?.content?.name ||
                    sub.character?.handle
                  }
                  size={40}
                />
                <span>{sub.character?.metadata?.content?.name}</span>
                <span className="text-zinc-400 truncate max-w-xs">
                  @{sub.character?.handle}
                </span>
              </UniLink>
              <UniLink href={CSB_SCAN + "/tx/" + sub.metadata?.proof}>
                <BlockchainIcon />
              </UniLink>
            </li>
          ))}
        </ul>
        <div className="h-16 border-t flex items-center px-5">
          <Button isBlock onClick={() => setIsFollowListOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </header>
  )
}
