import {
  useConnectModal,
  useAccountState,
  useDisconnectModal,
  GeneralAccount,
} from "@crossbell/connect-kit"
import { useAccountSites } from "~/queries/site"
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
import { useRefCallback } from "@crossbell/util-hooks"
import {
  useShowNotificationModal,
  useNotifications,
} from "@crossbell/notification"
import { useAccountBalance } from "~/hooks/use-account-balance"

export const ConnectButton: React.FC<{
  left?: boolean
  variant?: "text" | "primary" | "secondary" | "like" | "collect" | "crossbell"
  size?: "base" | "sm"
}> = ({ left, variant, size = "sm" }) => {
  let avatarSize
  let sizeDecrease
  switch (size) {
    case "base":
      avatarSize = 40
      sizeDecrease = "sm"
      break
    default:
      avatarSize = 30
      sizeDecrease = "xs"
  }

  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])

  const { show: openConnectModal } = useConnectModal()
  const { show: disconnect } = useDisconnectModal()
  const { balance } = useAccountBalance()
  const [copyLabelDisplay, copyLabel] = useCopyLabel(account)

  const userSites = useAccountSites()

  const showNotificationModal = useShowNotificationModal()
  const { isAllRead } = useNotifications()

  const dropdownLinks: HeaderLinkType[] = [
    {
      icon: <Square2StackIcon className="w-4 h-4" />,
      label: copyLabelDisplay,
      onClick: copyLabel,
    },
    {
      icon: (
        <span
          className={
            (isAllRead ? "i-bi:bell" : "i-bi:bell-fill") + " inline-block"
          }
        />
      ),
      label: isAllRead ? "Notifications" : "Unread notifications",
      onClick: showNotificationModal,
    },
    {
      icon: <DashboardIcon />,
      label: "Writer dashboard",
      url: `${SITE_URL}/dashboard`,
    },
    {
      icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />,
      label: "Disconnect",
      onClick: disconnect,
    },
  ]

  const [InsufficientBalance, setInsufficientBalance] = useState<boolean>(false)

  useEffect(() => {
    if (balance) {
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
    <div
      {...(!ssrReady && {
        "aria-hidden": true,
        style: {
          opacity: 0,
          pointerEvents: "none",
          userSelect: "none",
        },
      })}
    >
      {(() => {
        if (!account) {
          return (
            <Button
              className="text-accent"
              onClick={openConnectModal}
              style={{ height: avatarSize + "px" }}
              variant={variant || "primary"}
            >
              Connect
            </Button>
          )
        }
        return (
          <div
            className="relative group"
            style={{ gap: 12, height: avatarSize + "px" }}
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
                    size={avatarSize}
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <span
                      className={`text-left leading-none font-medium truncate ${
                        InsufficientBalance ? "text-red-600" : "text-gray-600"
                      } ${size === "base" ? "text-base" : "text-sm"}`}
                      style={{ marginBottom: "0.15rem" }}
                    >
                      {userSites.data?.[0]?.name ||
                        getAccountDisplayName(account)}
                    </span>
                    {userSites.data?.[0]?.username && (
                      <span
                        className={`text-left leading-none ${
                          sizeDecrease === "sm" ? "text-sm" : "text-xs"
                        } truncate ${
                          InsufficientBalance ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        {"@" + userSites.data?.[0]?.username ||
                          getAccountDisplayName(account)}
                      </span>
                    )}
                  </div>
                </button>
                <div
                  className={`absolute hidden ${
                    left ? "left" : "right"
                  }-0 pt-2 group-hover:block top-full z-10 text-gray-600`}
                >
                  <div
                    className={`bg-white rounded-lg ring-1 ring-zinc-100 min-w-[140px] shadow-md py-2 ${
                      size === "base" ? "text-base" : "text-sm"
                    }`}
                  >
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
                          className={`${
                            size === "base" ? "pl-5 pr-6 h-11" : "pl-4 pr-5 h-9"
                          } flex items-center w-full whitespace-nowrap hover:bg-zinc-100`}
                          aria-label={link.label}
                        >
                          <span className="mr-2 flex justify-center">
                            {link.icon}
                          </span>
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
}

function useCopyLabel(account: GeneralAccount | null) {
  const [isShowCopied, setIsShowCopied] = useState(false)

  const copyLabel = useRefCallback(() => {
    const value =
      (account?.type === "email" ? account.email : account?.address) || ""

    navigator.clipboard.writeText(value)
    setIsShowCopied(true)
    setTimeout(() => setIsShowCopied(false), 1000)
  })

  return [
    isShowCopied ? "Copied!" : getAccountDisplayName(account),
    copyLabel,
  ] as const
}

function getAccountDisplayName(account: GeneralAccount | null) {
  const value =
    (account?.type === "email" ? account.email : account?.address) || ""

  return value.slice(0, 5) + "..." + value.slice(-4)
}
