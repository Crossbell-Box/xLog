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
import { Link } from "react-scroll"
import { useTranslation } from "next-i18next"
import { Logo } from "~/components/common/Logo"

export function MainLayout({
  children,
  title,
  tabs,
}: {
  children?: React.ReactNode
  title?: string
  tabs?: string[]
}) {
  const { t } = useTranslation("index")

  return (
    <>
      <SEOHead
        title={title}
        siteName={APP_NAME}
        description={APP_DESCRIPTION}
      />
      <header className="py-5 fixed w-full top-0 bg-white z-10">
        <div className="max-w-screen-lg px-5 mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold flex items-center">
            <div className="inline-block w-9 h-9 mr-3">
              <Logo type="lottie" width={36} height={36} autoplay={false} />
            </div>
            xLog
          </div>
          <div className="space-x-14 text-zinc-500 flex">
            {tabs?.map((tab, index) => (
              <Link
                activeClass="text-accent"
                className="cursor-pointer items-center hidden sm:flex hover:text-accent"
                to={tab}
                spy={true}
                smooth={true}
                duration={500}
                key={tab}
              >
                {t(tab)}
              </Link>
            ))}
            <UniLink
              href={GITHUB_LINK}
              className="items-center hidden sm:flex hover:text-accent"
            >
              {t("Source Code")}
            </UniLink>
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
