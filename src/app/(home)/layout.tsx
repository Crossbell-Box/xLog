import { DarkModeSwitch } from "~/components/common/DarkModeSwitch"
import { UniLink } from "~/components/ui/UniLink"
import { APP_NAME, DISCORD_LINK, GITHUB_LINK, TWITTER_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"

import { Header } from "./components/Header"

export default async function HomeLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <footer className="mt-10 font-medium border-t">
        <div className="max-w-screen-lg px-5 py-14 mx-auto flex justify-between">
          <span className="text-zinc-700 ml-2 inline-flex items-center space-x-5 align-middle">
            {GITHUB_LINK && (
              <UniLink className="flex items-center" href={GITHUB_LINK}>
                <span className="inline-block icon-[mingcute--github-fill] text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {DISCORD_LINK && (
              <UniLink className="flex items-center" href={DISCORD_LINK}>
                <span className="inline-block icon-[mingcute--discord-fill] text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {TWITTER_LINK && (
              <UniLink className="flex items-center" href={TWITTER_LINK}>
                <span className="inline-block icon-[mingcute--twitter-fill] text-2xl hover:text-accent"></span>
              </UniLink>
            )}
          </span>
          <span className="inline-flex items-center space-x-4">
            <DarkModeSwitch />
            <span>
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
          </span>
        </div>
      </footer>
    </>
  )
}
