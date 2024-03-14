"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { XCharLogo, XFeedLogo } from "@crossbell/ui"
import { RssIcon } from "@heroicons/react/24/solid"

import { SearchInput } from "~/components/common/SearchInput"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Image } from "~/components/ui/Image"
import { Modal } from "~/components/ui/Modal"
import { Tooltip } from "~/components/ui/Tooltip"
import { CSB_SCAN, CSB_XCHAR, CSB_XFEED } from "~/lib/env"

import { Button } from "../ui/Button"
import { Menu } from "../ui/Menu"

function MoreActions({ children }: React.PropsWithChildren<{}>) {
  return (
    <Menu
      target={
        <Button
          variant="text"
          aria-label="more"
          className="-mx-2 text-zinc-600"
        >
          <i className="i-mingcute-more-1-line text-2xl" />
        </Button>
      }
      dropdown={<div className="text-sm">{children}</div>}
    />
  )
}

export const SiteHeaderMenu = ({
  handle,
  owner,
  hideSearch,
}: {
  handle?: string
  owner?: string
  hideSearch?: boolean
}) => {
  const t = useTranslations()
  const [searchOpen, setSearchOpen] = useState(false)

  const moreMenuItems = [
    {
      text: "View on xChar",
      icon: <XCharLogo className="size-full" />,
      url: `${CSB_XCHAR}/${handle}`,
    },
    {
      text: "View on xFeed",
      icon: <XFeedLogo className="size-full" />,
      url: `${CSB_XFEED}/u/${handle}`,
    },
    {
      text: "View on Hoot It",
      icon: (
        <div className="size-full">
          <Image
            alt="Hoot It"
            src="/assets/hoot.svg"
            className="rounded"
            width={16}
            height={16}
          />
        </div>
      ),
      url: `https://hoot.it/search/${handle}.csb/activities`,
    },
    {
      text: "View on Crossbell Scan",
      icon: <BlockchainIcon className="fill-[#c09526] size-full" />,
      url: `${CSB_SCAN}/address/${owner}`,
    },
    {
      text: "Subscribe to JSON Feed",
      icon: (
        <div className="size-full">
          <Image
            alt="JSON Feed"
            src="/assets/json-feed.png"
            className="rounded"
            width={16}
            height={16}
          />
        </div>
      ),
      url: "/feed?format=json",
    },
    {
      text: "Subscribe to RSS",
      icon: <RssIcon className="size-full text-[#ee832f]" />,
      url: "/feed",
      out: true,
    },
    ...(hideSearch
      ? []
      : [
          {
            text: "Search on this site",
            icon: (
              <span className="text-stone-400">
                <i className="i-mingcute-search-line block" />
              </span>
            ),
            onClick: () => setSearchOpen(true),
            out: true,
          },
        ]),
  ]

  return (
    <>
      <div className="xlog-site-more-menu relative inline-block align-middle">
        <MoreActions>
          {moreMenuItems.map((item) => (
            <MoreActions.Item
              key={item.text}
              icon={item.icon}
              {...(item.onClick
                ? {
                    type: "button",
                    onClick: item.onClick,
                  }
                : {
                    type: "link",
                    href: item.url,
                  })}
            >
              {t(item.text)}
            </MoreActions.Item>
          ))}
        </MoreActions>
      </div>
      <div className="xlog-site-more-out hidden sm:block">
        <div className="-mx-2 flex">
          {moreMenuItems.map((item) => {
            if (item.out) {
              return (
                <Tooltip
                  label={t(item.text)}
                  key={item.text}
                  placement="bottom"
                >
                  <Button
                    variant="text"
                    aria-label={item.text}
                    onClick={() =>
                      item.url
                        ? window.open(item.url, "_blank")
                        : item.onClick?.()
                    }
                  >
                    <span className="fill-gray-500 flex size-6 text-2xl">
                      {item.icon}
                    </span>
                  </Button>
                </Tooltip>
              )
            } else {
              return null
            }
          })}
        </div>
      </div>
      <Modal open={searchOpen} setOpen={setSearchOpen}>
        <div className="p-3">
          <SearchInput noBorder={true} onSubmit={() => setSearchOpen(false)} />
        </div>
      </Modal>
    </>
  )
}

MoreActions.Item = Menu.Item
