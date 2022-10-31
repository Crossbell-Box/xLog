import { Popover } from "@headlessui/react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "../ui/Avatar"
import type { Profile } from "unidata.js"

type Props = {
  subdomain: string
  subscriptions: Profile[]
  viewer?: { address?: string }
}

export const SiteSwitcher: React.FC<Props> = ({
  subdomain,
  subscriptions,
  viewer,
}) => {
  const activeSubscription = subscriptions.find((s) => s.username === subdomain)

  return (
    <div className="px-3 pt-3 pb-2 text-sm">
      <Popover className="relative">
        <Popover.Button className="h-8 px-2 justify-between flex w-full rounded-lg hover:bg-gray-200 hover:bg-opacity-50 transition-colors items-center">
          <div className="flex items-center space-x-2">
            <Avatar
              images={[getUserContentsUrl(activeSubscription?.avatars?.[0])]}
              name={activeSubscription?.name}
              size={22}
            />
            <span className="truncate">{activeSubscription?.name}</span>
          </div>
          <span className="w-5 h-5 text-zinc-400 rounded-full bg-zinc-100 inline-flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 14 14">
              <g
                stroke="none"
                strokeWidth="1"
                fill="currentColor"
                fillRule="evenodd"
              >
                <path d="M7.00,9.48 C7.08,9.48 7.16,9.46 7.24,9.43 C7.31,9.40 7.38,9.35 7.44,9.29 L11.16,5.48 C11.27,5.37 11.32,5.24 11.32,5.08 C11.32,4.98 11.30,4.88 11.25,4.79 C11.20,4.70 11.13,4.64 11.04,4.59 C10.96,4.54 10.86,4.51 10.76,4.51 C10.60,4.51 10.46,4.57 10.34,4.68 L6.76,8.36 L7.24,8.36 L3.65,4.68 C3.53,4.57 3.39,4.51 3.24,4.51 C3.13,4.51 3.03,4.54 2.95,4.59 C2.86,4.64 2.80,4.70 2.75,4.79 C2.70,4.88 2.67,4.98 2.67,5.08 C2.67,5.16 2.68,5.23 2.71,5.30 C2.74,5.37 2.78,5.43 2.83,5.48 L6.55,9.29 C6.69,9.42 6.83,9.48 7.00,9.48 Z"></path>
              </g>
            </svg>
          </span>
        </Popover.Button>
        <Popover.Panel className="absolute left-0 z-10 pt-1">
          <div className="min-w-[280px] rounded-lg shadow-modal bg-white">
            {viewer && (
              <div className="px-4 py-2 border-b text-sm text-zinc-500">
                {viewer.address?.slice(0, 6)}...{viewer.address?.slice(-4)}
              </div>
            )}
            <div className="p-2">
              {subscriptions?.map((subscription) => {
                return (
                  <Link
                    key={subscription.username}
                    href={`/dashboard/${subscription.username}`}
                    className="flex px-2 h-8 rounded-lg items-center justify-between hover:bg-zinc-100"
                  >
                    <span className="truncate w-8/12">{subscription.name}</span>
                    {activeSubscription?.username === subscription.username && (
                      <span className="text-accent">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
            <div className="border-t py-2 px-2">
              <Link href={`/dashboard/new-site`}>
                <a className="rounded-lg text-sm text-zinc-500 flex px-2 h-8 items-center hover:bg-zinc-100">
                  Create a new site
                </a>
              </Link>
            </div>
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  )
}
