import { QRCodeSVG } from "qrcode.react"

import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid"

import { Tooltip } from "~/components/ui/Tooltip"
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
        <span className="inline-block i-mingcute-rss-2-fill text-2xl"></span>
      </UniLink>
      <Tooltip
        className="z-10 bg-white"
        childrenClassName="flex-1 flex justify-center text-sky-500"
        label={
          <QRCodeSVG
            value="https://oia.xlog.app"
            className="aspect-square w-[200px] p-2"
            height={200}
            width={200}
          />
        }
        placement="bottom"
      >
        <UniLink href="https://oia.xlog.app">
          <DevicePhoneMobileIcon className="size-[23px]" />
        </UniLink>
      </Tooltip>
      {GITHUB_LINK && (
        <UniLink
          className="flex-1 flex justify-center text-[#181717] dark:text-[#e6edf3]"
          href={GITHUB_LINK}
        >
          <span className="inline-block i-mingcute-github-fill text-2xl"></span>
        </UniLink>
      )}
      {DISCORD_LINK && (
        <UniLink
          className="flex-1 flex justify-center text-[#7289da]"
          href={DISCORD_LINK}
        >
          <span className="inline-block i-mingcute-discord-fill text-2xl"></span>
        </UniLink>
      )}
      {TWITTER_LINK && (
        <UniLink
          className="flex-1 flex justify-center text-[#1DA1F2]"
          href={TWITTER_LINK}
        >
          <span className="inline-block i-mingcute-twitter-fill text-2xl"></span>
        </UniLink>
      )}
    </div>
  )
}
