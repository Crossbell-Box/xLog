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
  viewer: Viewer | null
}> = ({ siteName, description, icon, navigation, subscribed, viewer }) => {
  const setSubscribeModalOpened = useStore(
    (store) => store.setSubscribeModalOpened,
  )
  const setLoginModalOpened = useStore((store) => store.setLoginModalOpened)

  const handleClickSubscribe = () => {
    setSubscribeModalOpened(true)
  }

  const leftLinks: HeaderLinkType[] = [
    { label: "Home", url: "/" },
    ...(navigation || []),
  ]

  const dropdownLinks: HeaderLinkType[] = [
    {
      icon: <DashboardIcon />,
      label: "Writer dashboard",
      url: `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}/dashboard`,
    },
    {
      label: "Sign out",
      onClick() {
        logout()
      },
    },
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
                  variant={subscribed ? "secondary" : "primary"}
                  onClick={handleClickSubscribe}
                  className="space-x-1"
                >
                  <span className="pl-1">
                    {subscribed ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="m23.5 17l-5 5l-3.5-3.5l1.5-1.5l2 2l3.5-3.5l1.5 1.5M13 18H3V8l8 5l8-5v5h2V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10v-2m6-12l-8 5l-8-5h16Z"
                        ></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M19 15v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2m-5 3H3V8l8 5l8-5v5h2V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h11v-2m5-12l-8 5l-8-5h16Z"
                        ></path>
                      </svg>
                    )}
                  </span>
                  <span className="pr-1">
                    {subscribed ? "Subscribed" : "Subscribe"}
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
          {viewer ? (
            <div className="relative group">
              <button
                type="button"
                className="inline-flex space-x-2 items-center h-10"
              >
                <Avatar
                  images={[getUserContentsUrl(viewer.avatar)]}
                  name={viewer.name}
                  size={24}
                />
                <span>{viewer.name}</span>
              </button>
              <div className="absolute hidden right-0 pt-1 group-hover:block">
                <div className="bg-white rounded-lg ring-1 ring-zinc-100 min-w-[140px] shadow-md py-2">
                  {dropdownLinks.map((link, i) => {
                    return (
                      <UniLink
                        key={i}
                        href={link.url}
                        onClick={link.onClick}
                        className="px-4 h-8 flex items-center w-full whitespace-nowrap hover:bg-zinc-100"
                      >
                        {link.label}
                      </UniLink>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setLoginModalOpened(true)}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
