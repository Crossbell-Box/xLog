import { APP_DESCRIPTION, APP_NAME, GITHUB_LINK, DISCORD_LINK } from "~/lib/env"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { ConnectButton } from "../common/ConnectButton"
import { getSiteLink } from "~/lib/helpers"
import Image from "next/image"

export function MainLayout({
  children,
  title,
}: {
  children?: React.ReactNode
  title?: string
}) {
  return (
    <>
      <SEOHead
        title={title}
        siteName={APP_NAME}
        description={APP_DESCRIPTION}
      />
      <header className="py-10">
        <div className="max-w-screen-lg px-5 mx-auto flex justify-between items-center">
          <div className="text-3xl font-extrabold flex items-center">
            <div className="inline-block w-16 h-16 mr-4">
              <Image alt={APP_NAME} src="/logo.svg" width={100} height={100} />
            </div>
            {APP_NAME.toUpperCase()}
          </div>
          <div className="space-x-5 text-zinc-500">
            <ConnectButton />
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 font-medium text-zinc-500 border-t">
        <div className="max-w-screen-lg px-5 py-14 mx-auto flex justify-between">
          <div>
            <span className="align-middle">
              &copy;{" "}
              <UniLink
                href={getSiteLink({
                  subdomain: "blog",
                })}
                className="hover:text-indigo-500"
              >
                {APP_NAME}
              </UniLink>
            </span>
            <span className="text-zinc-400 ml-2 inline-flex items-center space-x-1 align-middle">
              <UniLink className="flex items-center" href={DISCORD_LINK}>
                <span className="inline-block i-mdi-discord text-xl hover:text-indigo-500"></span>
              </UniLink>
              {GITHUB_LINK && (
                <UniLink className="flex items-center" href={GITHUB_LINK}>
                  <span className="inline-block i-mdi-github text-xl hover:text-zinc-900"></span>
                </UniLink>
              )}
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
