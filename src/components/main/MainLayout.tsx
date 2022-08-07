import {
  APP_DESCRIPTION,
  APP_NAME,
  DOCS_DOMAIN,
  GITHUB_LINK,
  OUR_DOMAIN,
  DISCORD_LINK,
} from "~/lib/env"
import { useStore } from "~/lib/store"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { ConnectButton } from "../common/ConnectButton"
import { getSiteLink } from "~/lib/helpers"

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
        <div className="max-w-screen-md px-5 mx-auto flex justify-between items-center">
          <h1 className="inline-block text-2xl font-extrabold">{APP_NAME}</h1>
          <div className="space-x-5 text-zinc-500">
            <ConnectButton />
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 text-sm font-medium text-zinc-500">
        <div className="max-w-screen-md px-5 mx-auto flex justify-between">
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
              <UniLink href={DISCORD_LINK}>
                <span className="inline-block i-mdi-discord text-xl hover:text-indigo-500"></span>
              </UniLink>
              {GITHUB_LINK && (
                <UniLink href={GITHUB_LINK}>
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
