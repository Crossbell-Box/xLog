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
import Image from "next/image"
import { Link } from "react-scroll"

export function MainLayout({
  children,
  title,
  tabs,
}: {
  children?: React.ReactNode
  title?: string
  tabs?: string[]
}) {
  return (
    <>
      <SEOHead
        title={title}
        siteName={APP_NAME}
        description={APP_DESCRIPTION}
      />
      <header className="py-5 fixed w-full top-0 bg-white z-50">
        <div className="max-w-screen-lg px-5 mx-auto flex justify-between items-center">
          <div className="text-3xl font-extrabold flex items-center">
            <div className="inline-block w-9 h-9">
              <Image alt={APP_NAME} src="/logo.svg" width={100} height={100} />
            </div>
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
                {tab}
              </Link>
            ))}
            <UniLink
              href={GITHUB_LINK}
              className="items-center hidden sm:flex hover:text-accent"
            >
              GitHub
            </UniLink>
            <ConnectButton />
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 font-medium border-t">
        <div className="max-w-screen-lg px-5 py-14 mx-auto flex justify-between">
          <span className="text-zinc-700 ml-2 inline-flex items-center space-x-5 align-middle">
            {GITHUB_LINK && (
              <UniLink className="flex items-center" href={GITHUB_LINK}>
                <span className="inline-block i-mdi-github text-2xl hover:text-zinc-900"></span>
              </UniLink>
            )}
            {DISCORD_LINK && (
              <UniLink className="flex items-center" href={DISCORD_LINK}>
                <span className="inline-block i-mdi-discord text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {TWITTER_LINK && (
              <UniLink className="flex items-center" href={TWITTER_LINK}>
                <span className="inline-block i-mdi-twitter text-2xl hover:text-accent"></span>
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
