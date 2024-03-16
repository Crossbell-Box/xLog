"use client"

import {
  CrossbellChainLogo,
  XCharLogo,
  XFeedLogo,
  XShopLogo,
  XSyncLogo,
} from "@crossbell/ui"
import { RssIcon } from "@heroicons/react/24/outline"

import { Image } from "~/components/ui/Image"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"

export function Integration() {
  const integrations = [
    {
      name: "RSS",
      icon: <RssIcon className="size-full text-orange-500" />,
      url:
        getSiteLink({
          subdomain: "xlog",
        }) + "/feed",
    },
    {
      name: "JSON Feed",
      icon: <Image src="/assets/json-feed.png" alt="JSON Feed" />,
      url:
        getSiteLink({
          subdomain: "xlog",
        }) + "/feed",
    },
    {
      name: "xChar",
      icon: <XCharLogo className="size-full" />,
      url: "https://xchar.app/",
    },
    {
      name: "xFeed",
      icon: <XFeedLogo className="size-full" />,
      url: "https://xfeed.app/",
    },
    {
      name: "xSync",
      icon: <XSyncLogo className="size-full" />,
      url: "https://xsync.app/",
    },
    {
      name: "xShop",
      icon: <XShopLogo className="size-full" />,
      text: "Coming soon",
    },
    {
      name: "Crossbell Scan",
      icon: <CrossbellChainLogo className="size-full text-[#E7B75B]" />,
      url: "https://scan.crossbell.io/",
    },
    {
      name: "Crossbell Faucet",
      icon: <CrossbellChainLogo className="size-full text-[#E7B75B]" />,
      url: "https://faucet.crossbell.io/",
    },
    {
      name: "Crossbell Export",
      icon: <CrossbellChainLogo className="size-full text-[#E7B75B]" />,
      url: "https://export.crossbell.io/",
    },
    {
      name: "Crossbell SDK",
      icon: <CrossbellChainLogo className="size-full text-[#E7B75B]" />,
      url: "https://crossbell-box.github.io/crossbell.js/",
    },
    {
      name: "RSS3",
      icon: (
        <Image alt="RSS3" src="/assets/rss3.svg" className="rounded" fill />
      ),
      url: "https://rss3.io/",
    },
    {
      name: "Hoot It",
      icon: (
        <Image alt="Hoot It" src="/assets/hoot.svg" className="rounded" fill />
      ),
      url: "https://hoot.it/search/xLog",
    },
    {
      name: "Raycast",
      icon: <Image src="/assets/raycast.png" alt="Raycast" />,
      url: "https://www.raycast.com/Songkeys/crossbell",
    },
    {
      name: "Obsidian",
      icon: (
        <Image
          src="/assets/obsidian.svg"
          alt="Obsidian"
          className="rounded"
          fill
        />
      ),
      text: "Coming soon",
    },
  ]
  return (
    <>
      {integrations.map((item, index) => (
        <li
          className="hover:scale-105 transition-transform duration-300"
          key={index}
        >
          {item.url ? (
            <UniLink
              href={item.url}
              className="w-full flex items-center flex-col justify-center"
            >
              <div className="size-12 rounded-md overflow-hidden">
                {item.icon}
              </div>
              <div className="font-medium sm:text-lg mt-2 text-center">
                {item.name}
              </div>
            </UniLink>
          ) : (
            <Tooltip label={item.text!}>
              <div className="size-full flex items-center flex-col justify-center">
                <div className="size-12 rounded-md overflow-hidden">
                  {item.icon}
                </div>
                <div className="font-medium sm:text-lg mt-2 text-center">
                  {item.name}
                </div>
              </div>
            </Tooltip>
          )}
        </li>
      ))}
    </>
  )
}
