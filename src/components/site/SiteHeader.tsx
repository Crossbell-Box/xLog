import clsx from "clsx"
import { useRouter } from "next/router"
import { logout } from "~/lib/auth.client"
import { IS_PROD } from "~/lib/constants"
import { OUR_DOMAIN } from "~/lib/env"
import { useStore } from "~/lib/store"
import { Viewer } from "~/lib/types"
import { getUserContentsUrl } from "~/lib/user-contents"
import { truthy } from "~/lib/utils"
import { DashboardIcon } from "../icons/DashboardIcon"
import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { Profile } from "unidata.js"
import { ConnectButton } from "../common/ConnectButton"
import { RSS3Icon } from "../icons/RSS3"
import { CrossbellIcon } from "../icons/Crossbell"
import { useAccount } from "wagmi"

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
  siteName: string | undefined
  description: string | undefined | null
  icon: string | null | undefined
  navigation?: HeaderLinkType[]
  subscribed?: boolean
}> = ({ siteName, description, icon, navigation, subscribed }) => {
  const setSubscribeModalOpened = useStore(
    (store) => store.setSubscribeModalOpened,
  )
  const setLoginModalOpened = useStore((store) => store.setLoginModalOpened)
  const { data: viewer } = useAccount()

  const handleClickSubscribe = () => {
    setSubscribeModalOpened(true)
  }

  const leftLinks: HeaderLinkType[] = [
    { label: "Home", url: "/" },
    ...(navigation || []),
  ]

  return (
    <header className="border-b">
      <div className="px-5 max-w-screen-md mx-auto">
        <div className="flex py-10">
          <div className="flex space-x-6 items-center">
            {icon && (
              <Avatar
                images={[getUserContentsUrl(icon)]}
                size={100}
                name={siteName}
              />
            )}
            <div>
              <div className="text-2xl font-bold">{siteName}</div>
              {description && (
                <div className="text-gray-500 text-sm">{description}</div>
              )}
              <div className="mt-3 text-sm">
                <Button
                  rounded="full"
                  size="sm"
                  variant="rss3"
                  onClick={() => window.open(`https://rss3.io/result?search=${viewer?.address}&filter=social`, '_blank')}
                  className="space-x-1 mr-2"
                >
                  <span className="pl-1">
                    <RSS3Icon />
                  </span>
                  <span className="pr-1">
                    Watch on RSS3
                  </span>
                </Button>
                <Button
                  rounded="full"
                  size="sm"
                  variant="crossbell"
                  onClick={() => window.open(`https://crossbell.io`, '_blank')}
                  className="space-x-1"
                >
                  <span className="pl-1">
                    <CrossbellIcon />
                  </span>
                  <span className="pr-1">
                    Follow on Crossbell
                  </span>
                </Button>
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
