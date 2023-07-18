import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid"

import { UniLink } from "~/components/ui/UniLink"
import { DISCORD_LINK, GITHUB_LINK, TWITTER_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"

export default async function PromotionLinks({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <UniLink
        className="flex-1 flex justify-center text-[#ee832f]"
        href={`${getSiteLink({
          subdomain: "xlog",
        })}/xlog-rss`}
      >
        <span className="inline-block icon-[mingcute--rss-2-fill] text-2xl"></span>
      </UniLink>
      <UniLink
        className="flex-1 flex justify-center text-sky-500"
        href="https://oia.xlog.app"
      >
        <DevicePhoneMobileIcon className="w-[23px] h-[23px]" />
      </UniLink>
      {GITHUB_LINK && (
        <UniLink
          className="flex-1 flex justify-center text-[#181717]"
          href={GITHUB_LINK}
        >
          <span className="inline-block icon-[mingcute--github-fill] text-2xl"></span>
        </UniLink>
      )}
      {DISCORD_LINK && (
        <UniLink
          className="flex-1 flex justify-center text-[#7289da]"
          href={DISCORD_LINK}
        >
          <span className="inline-block icon-[mingcute--discord-fill] text-2xl"></span>
        </UniLink>
      )}
      {TWITTER_LINK && (
        <UniLink
          className="flex-1 flex justify-center text-[#1DA1F2]"
          href={TWITTER_LINK}
        >
          <span className="inline-block icon-[mingcute--twitter-fill] text-2xl"></span>
        </UniLink>
      )}
    </div>
  )
}
