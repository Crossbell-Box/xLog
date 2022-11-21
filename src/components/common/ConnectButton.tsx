import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { useGetUserSites } from "~/queries/site"
import { useAccount, useDisconnect, useBalance } from "wagmi"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import type { HeaderLinkType } from "~/components/site/SiteHeader"
import { DashboardIcon } from "../icons/DashboardIcon"
import { UniLink } from "../ui/UniLink"
import { useEffect, useState } from "react"
import {
  Square2StackIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { BigNumber } from "ethers"
import { SITE_URL } from "~/lib/env"

export const ConnectButton: React.FC<{
  left?: boolean
  variant?: "text" | "primary" | "secondary" | "like" | "collect" | "crossbell"
}> = ({ left, variant }) => {
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
      icon: <Square2StackIcon className="w-4 h-4" />,
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
      url: `${SITE_URL}/dashboard`,
    },
    {
      icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />,
      label: "Disconnect",
      onClick() {
        disconnect()
      },
    },
  ]

  const { data: balance } = useBalance({
    address: address,
  })

  const [InsufficientBalance, setInsufficientBalance] = useState<boolean>(false)

  useEffect(() => {
    if (balance !== undefined) {
      if (
        BigNumber.from(balance.value).gt(
          BigNumber.from("1" + "0".repeat(balance.decimals - 2)),
        )
      ) {
        setInsufficientBalance(false)
      } else {
        setInsufficientBalance(true)
      }
    }
  }, [balance])

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
                  <Button
                    className="text-accent"
                    onClick={openConnectModal}
                    style={{ height: "30px" }}
                    variant={variant || "primary"}
                  >
                    Connect
                  </Button>
                )
              }
              return (
                <div
                  className="relative group"
                  style={{ gap: 12, height: "30px" }}
                >
                  {userSites.isSuccess ? (
                    <>
                      <button
                        className="flex items-center w-full"
                        type="button"
                        aria-label="connector"
                      >
                        <Avatar
                          className="align-middle mr-2"
                          images={userSites.data?.[0]?.avatars || []}
                          name={userSites.data?.[0]?.name}
                          size={30}
                        />
                        <div className="flex-1 flex flex-col min-w-0">
                          <span
                            className={`text-left leading-none font-medium truncate ${
                              InsufficientBalance
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                            style={{ marginBottom: "0.15rem" }}
                          >
                            {userSites.data?.[0]?.name || account.displayName}
                          </span>
                          {userSites.data?.[0]?.username && (
                            <span
                              className={`text-left leading-none text-xs truncate ${
                                InsufficientBalance
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            >
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
                          {InsufficientBalance && (
                            <UniLink
                              href="https://faucet.crossbell.io/"
                              className="text-red-600 px-4 h-8 flex items-center w-full whitespace-nowrap hover:bg-zinc-100"
                            >
                              <span className="mr-2 fill-red-600 i-bxs:bell"></span>
                              Insufficient $CSB balance ({balance?.formatted})
                            </UniLink>
                          )}
                          {dropdownLinks.map((link, i) => {
                            return (
                              <UniLink
                                key={i}
                                href={link.url}
                                onClick={link.onClick}
                                className="px-4 h-8 flex items-center w-full whitespace-nowrap hover:bg-zinc-100"
                                aria-label={link.label}
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
