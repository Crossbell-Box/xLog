import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { useGetUserSites } from "~/queries/site"
import { useAccount, useDisconnect } from "wagmi"
import { Avatar } from "~/components/ui/Avatar"
import type { HeaderLinkType } from "~/components/site/SiteHeader"
import { DashboardIcon } from "../icons/DashboardIcon"
import { IS_PROD } from "~/lib/constants"
import { OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { useEffect, useState } from "react"
import { DuplicateIcon, LogoutIcon } from "@heroicons/react/outline"

export const ConnectButton: React.FC<{
  left?: boolean
}> = ({ left }) => {
  const { address } = useAccount()
  const userSites = useGetUserSites(address)
  const { disconnect } = useDisconnect()

  const [copyLabel, setCopyLabel] = useState("")
  useEffect(() => {
    if (address) {
      setCopyLabel(address?.slice(0, 5) + "..." + address?.slice(-4))
    }
  }, [address])

  const dropdownLinks: HeaderLinkType[] = [
    {
      icon: <DuplicateIcon className="w-4 h-4" />,
      label: copyLabel,
      onClick() {
        navigator.clipboard.writeText(address || "")
        setCopyLabel("Copied!")
        setTimeout(() => {
          setCopyLabel(address?.slice(0, 5) + "..." + address?.slice(-4))
        }, 1000)
      },
    },
    {
      icon: <DashboardIcon />,
      label: "Writer dashboard",
      url: `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}/dashboard`,
    },
    {
      icon: <LogoutIcon className="w-4 h-4" />,
      label: "Disconnect",
      onClick() {
        disconnect()
      },
    },
  ]

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <button
                    className="text-indigo-600"
                    onClick={openConnectModal}
                    type="button"
                    style={{ height: "30px" }}
                  >
                    Connect Wallet
                  </button>
                )
              }
              return (
                <div
                  className="flex relative group"
                  style={{ gap: 12, height: "30px" }}
                >
                  {userSites.isSuccess ? (
                    <>
                      <button className="flex items-center" type="button">
                        <Avatar
                          className="align-middle mr-2"
                          images={userSites.data?.[0]?.avatars || []}
                          name={userSites.data?.[0]?.name}
                          size={30}
                        />
                        <div className="flex flex-col">
                          <span
                            className="text-left leading-none text-gray-600 font-bold"
                            style={{ marginBottom: "0.15rem" }}
                          >
                            {userSites.data?.[0]?.name || account.displayName}
                          </span>
                          {userSites.data?.[0]?.username && (
                            <span className="text-left leading-none text-xs text-gray-400">
                              {"@" + userSites.data?.[0]?.username ||
                                account.displayName}
                            </span>
                          )}
                        </div>
                      </button>
                      <div
                        className={`absolute hidden ${
                          left ? "left" : "right"
                        }-0 pt-2 group-hover:block top-full z-10 text-gray-600`}
                      >
                        <div className="bg-white rounded-lg ring-1 ring-zinc-100 min-w-[140px] shadow-md py-2 text-sm">
                          {dropdownLinks.map((link, i) => {
                            return (
                              <UniLink
                                key={i}
                                href={link.url}
                                onClick={link.onClick}
                                className="px-4 h-8 flex items-center w-full whitespace-nowrap hover:bg-zinc-100"
                              >
                                <span className="mr-2">{link.icon}</span>
                                {link.label}
                              </UniLink>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              )
            })()}
          </div>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}
