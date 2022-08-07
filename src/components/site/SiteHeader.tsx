import clsx from "clsx"
import { useRouter } from "next/router"
import { logout } from "~/lib/auth.client"
import { IS_PROD } from "~/lib/constants"
import { SITE_URL } from "~/lib/env"
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
  useSubscribeToSite,
  useUnsubscribeFromSite,
  useGetUserSites,
} from "~/queries/site"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Menu } from "@headlessui/react"
import { MoreIcon } from "~/components/icons/MoreIcon"
import { RSS3Icon } from "~/components/icons/RSS3Icon"
import { CrossbellIcon } from "~/components/icons/CrossbellIcon"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"

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
        active ? `text-indigo-700 border-accent` : `border-transparent`,
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

  useEffect(() => {
    if (followProgress && address && subscription.isSuccess && site?.username) {
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
      icon: <CrossbellIcon />,
      url: `https://crossbell.kindjeff.com/@${site?.username}`,
    },
    {
      text: "View on RSS3",
      icon: <RSS3Icon />,
      url: `https://rss3.io/result?search=${site?.metadata?.owner}`,
    },
    {
      text: "View on blockchain explorer",
      icon: <BlockchainIcon />,
      url: `https://scan.crossbell.io/address/${site?.metadata?.owner}/transactions`,
    },
  ]

  return (
    <header className="border-b">
      <div className="px-5 max-w-screen-md mx-auto">
        <div className="flex py-10">
          <div className="flex space-x-6 items-center">
            {site?.avatars?.[0] && (
              <Avatar
                images={[getUserContentsUrl(site?.avatars?.[0])]}
                size={100}
                name={site?.name}
              />
            )}
            <div>
              <div className="text-2xl font-bold">{site?.name}</div>
              {site?.bio && (
                <div className="text-gray-500 text-sm">{site?.bio}</div>
              )}
              <div className="mt-3 text-sm">
                {subscription.data ? (
                  <Button
                    rounded="full"
                    size="sm"
                    variant="secondary"
                    onClick={handleClickSubscribe}
                    className="space-x-1 group align-middle"
                    isLoading={
                      unsubscribeFromSite.isLoading || subscribeToSite.isLoading
                    }
                  >
                    <span className="pl-1">
                      <CrossbellIcon />
                    </span>
                    <span className="pr-1 group-hover:hidden w-16">
                      Following
                    </span>
                    <span className="pr-1 hidden group-hover:block w-16">
                      Unfollow
                    </span>
                  </Button>
                ) : (
                  <Button
                    rounded="full"
                    size="sm"
                    variant="crossbell"
                    onClick={handleClickSubscribe}
                    className="space-x-1 align-middle"
                    isLoading={
                      userSite.isLoading ||
                      unsubscribeFromSite.isLoading ||
                      subscribeToSite.isLoading ||
                      subscription.isLoading
                    }
                  >
                    <span className="pl-1">
                      <CrossbellIcon />
                    </span>
                    <span className="pr-1">Follow</span>
                  </Button>
                )}
                <div className="relative inline-block align-middle h-7">
                  <Menu>
                    {() => (
                      <>
                        <Menu.Button as={Fragment}>
                          <Button
                            rounded="full"
                            size="sm"
                            variant="secondary"
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <MoreIcon className="w-5 h-5" />
                          </Button>
                        </Menu.Button>
                        <Menu.Items className="text-sm absolute z-20 left-0 top-8 bg-white shadow-modal rounded-lg overflow-hidden py-2 w-60 text-gray-500">
                          {moreMenuItems.map((item) => {
                            return (
                              <UniLink
                                key={item.text}
                                href={item.url}
                                className="h-10 flex w-full space-x-2 items-center px-3 hover:bg-gray-100"
                              >
                                <span className="fill-gray-500">
                                  {item.icon}
                                </span>
                                <span>{item.text}</span>
                              </UniLink>
                            )
                          })}
                        </Menu.Items>
                      </>
                    )}
                  </Menu>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400 flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {leftLinks.map((link, i) => {
              return <HeaderLink link={link} key={`${link.label}${i}`} />
            })}
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
