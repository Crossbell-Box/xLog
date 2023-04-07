import {
  APP_DESCRIPTION,
  APP_NAME,
  GITHUB_LINK,
  DISCORD_LINK,
  TWITTER_LINK,
} from "~/lib/env"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { ConnectButton } from "../common/ConnectButton"
import { getSiteLink } from "~/lib/helpers"
import { useTranslation } from "next-i18next"
import { Logo } from "~/components/common/Logo"
import { useRouter } from "next/router"
import { cn } from "~/lib/utils"
import { Image } from "../ui/Image"

const tabs = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Activities",
    link: "/activities",
  },
  {
    name: (
      <Image
        className="no-optimization w-24"
        alt="github stars"
        src="https://img.shields.io/github/stars/Crossbell-Box/xLog?color=white&label=Stars&logo=github&style=social"
      />
    ),
    link: GITHUB_LINK,
  },
]

export function MainLayout({
  children,
  title,
}: {
  children?: React.ReactNode
  title?: string
}) {
  const { t } = useTranslation("index")
  const router = useRouter()

  return (
    <>
      <SEOHead
        title={title}
        siteName={APP_NAME}
        description={APP_DESCRIPTION}
      />
      <header className="py-5 fixed w-full top-0 bg-white z-10">
        <div className="max-w-screen-lg px-5 mx-auto flex justify-between items-center">
          <UniLink
            href="/"
            className="text-2xl font-extrabold flex items-center"
          >
            <div className="inline-block w-9 h-9 mr-3">
              <Logo type="lottie" width={36} height={36} autoplay={false} />
            </div>
            xLog
          </UniLink>
          <div className="space-x-14 text-zinc-500 flex">
            {tabs?.map((tab, index) => (
              <UniLink
                className={cn(
                  "cursor-pointer items-center hidden sm:flex hover:text-accent text-lg",
                  {
                    "text-accent": router.pathname === tab.link,
                  },
                )}
                key={tab.link}
                href={tab.link}
              >
                {typeof tab.name === "string" ? t(tab.name) : tab.name}
              </UniLink>
            ))}
            <ConnectButton size="base" variantColor="black" />
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 font-medium border-t">
        <div className="max-w-screen-lg px-5 py-14 mx-auto flex justify-between">
          <span className="text-zinc-700 ml-2 inline-flex items-center space-x-5 align-middle">
            {GITHUB_LINK && (
              <UniLink className="flex items-center" href={GITHUB_LINK}>
                <span className="inline-block i-mingcute:github-fill text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {DISCORD_LINK && (
              <UniLink className="flex items-center" href={DISCORD_LINK}>
                <span className="inline-block i-mingcute:discord-fill text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {TWITTER_LINK && (
              <UniLink className="flex items-center" href={TWITTER_LINK}>
                <span className="inline-block i-mingcute:twitter-fill text-2xl hover:text-accent"></span>
              </UniLink>
            )}
          </span>
          <span className="align-middle">
            &copy;{" "}
            <UniLink
              href={getSiteLink({
                subdomain: "xlog",
              })}
              className="hover:text-accent"
            >
              {APP_NAME}
            </UniLink>
          </span>
        </div>
      </footer>
    </>
  )
}
