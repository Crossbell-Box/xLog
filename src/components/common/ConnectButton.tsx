import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"

import {
  GeneralAccount,
  useAccountBalance,
  useAccountState,
  useConnectModal,
  useCsbDetailModal,
  useDisconnectModal,
  useIsOpSignEnabled,
  useOpSignSettingsModal,
  useSelectCharactersModal,
  useUpgradeEmailAccountModal,
} from "@crossbell/connect-kit"
import {
  useNotifications,
  useShowNotificationModal,
} from "@crossbell/notification"
import { useRefCallback } from "@crossbell/util-hooks"
import {
  BellIcon,
  FaceFrownIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline"
import { BellAlertIcon } from "@heroicons/react/24/solid"

import { Avatar } from "~/components/ui/Avatar"
import { Button, type Variant, type VariantColor } from "~/components/ui/Button"
import { Menu } from "~/components/ui/Menu"
import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"

import { UniLink } from "../ui/UniLink"

type HeaderLinkType = {
  icon?: React.ReactNode
  label: string | JSX.Element
  url?: string
  onClick?: () => void
}

export const ConnectButton: React.FC<{
  left?: boolean
  variant?: Variant
  variantColor?: VariantColor
  size?: "base" | "sm"
  hideNotification?: boolean
  mobileSimplification?: boolean
  hideName?: boolean
}> = ({
  left,
  variant,
  variantColor,
  size = "sm",
  hideNotification,
  mobileSimplification,
  hideName,
}) => {
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
  const isOpSignEnabled = useIsOpSignEnabled({
    characterId: account?.characterId,
  })

  const { show: openConnectModal } = useConnectModal()
  const { show: disconnect } = useDisconnectModal()
  const { balance } = useAccountBalance()
  const [copyLabelDisplay, copyLabel] = useCopyLabel(account)
  const csbDetailModal = useCsbDetailModal()
  const opSignSettingsModal = useOpSignSettingsModal()
  const upgradeAccountModal = useUpgradeEmailAccountModal()
  const selectCharactersModal = useSelectCharactersModal()

  const showNotificationModal = useShowNotificationModal()
  const { isAllRead } = useNotifications()

  const [InsufficientBalance, setInsufficientBalance] = useState<boolean>(false)
  const { t } = useTranslation("common")

  useEffect(() => {
    if (balance) {
      if (
        BigInt(balance.value.toString()) >
        BigInt("1" + "0".repeat(balance.decimals - 2))
      ) {
        setInsufficientBalance(false)
      } else {
        setInsufficientBalance(true)
      }
    }
  }, [balance])

  const dropdownLinks: HeaderLinkType[] = [
    {
      icon: "icon-[mingcute--home-1-line]",
      label: t("My xLog") || "",
      url: getSiteLink({
        subdomain: account?.character?.handle || "",
      }),
    },
    {
      icon: "icon-[mingcute--grid-line]",
      label: t("Dashboard") || "",
      url: `${SITE_URL}/dashboard`,
    },
    {
      icon: "icon-[mingcute--copy-2-line]",
      label: t(copyLabelDisplay) || "",
      onClick: copyLabel,
    },
    ...(account?.type === "wallet"
      ? [
          {
            icon: "icon-[mingcute--seal-line]",
            label: (
              <>
                {t("Operator Sign")} (
                {isOpSignEnabled ? (
                  <FaceSmileIcon className="w-4 h-4" />
                ) : (
                  <FaceFrownIcon className="w-4 h-4" />
                )}
                )
              </>
            ),
            onClick: () => {
              if (account?.characterId) {
                opSignSettingsModal.show({
                  characterId: account?.characterId,
                })
              }
            },
          },
          {
            icon: "icon-[mingcute--currency-euro-line]",
            label: (
              <span className={InsufficientBalance ? "text-red-400" : ""}>
                {balance?.formatted.replace(/\.(\d{5})\d*$/, ".$1") ||
                  "0.00000"}{" "}
                CSB
              </span>
            ),
            onClick: csbDetailModal.show,
          },
          {
            icon: "icon-[mingcute--repeat-line]",
            label: t("Switch Characters") || "",
            onClick: selectCharactersModal.show,
          },
        ]
      : [
          {
            icon: "icon-[mingcute--vip-2-line]",
            label: t("Upgrade to Wallet") || "",
            onClick: upgradeAccountModal.show,
          },
        ]),
    {
      icon: "icon-[mingcute--exit-line]",
      label: t("Disconnect") || "",
      onClick: disconnect,
    },
  ]

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
              variantColor={variantColor}
            >
              {t("Connect")}
            </Button>
          )
        }
        return (
          <div
            className="relative flex items-center -mr-2"
            style={{ height: avatarSize + "px" }}
          >
            {!hideNotification && (
              <>
                {isAllRead ? (
                  <BellIcon
                    className={`${
                      size === "base" ? "w-6 h-6" : "w-5 h-5"
                    } text-zinc-500 cursor-pointer sm:hover:animate-buzz-out`}
                    onClick={showNotificationModal}
                  />
                ) : (
                  <BellAlertIcon
                    className={`${
                      size === "base" ? "w-6 h-6" : "w-5 h-5"
                    } text-accent cursor-pointer sm:hover:animate-buzz-out`}
                    onClick={showNotificationModal}
                  />
                )}
                <div className="h-full w-[2px] py-1 ml-3">
                  <div className="w-full h-full bg-zinc-200 rounded-full"></div>
                </div>
              </>
            )}
            <Menu
              placement="bottom-end"
              target={
                <button
                  className="flex items-center w-full hover:bg-hover transition-colors py-1 px-2 rounded-lg ml-1"
                  type="button"
                  aria-label="connector"
                >
                  <Avatar
                    className="align-middle"
                    images={account.character?.metadata?.content?.avatars || []}
                    name={account.character?.metadata?.content?.name}
                    size={avatarSize}
                  />
                  {!hideName && (
                    <>
                      <div
                        className={`flex-1 flex-col min-w-0 ml-2 max-w-[100px] ${
                          mobileSimplification ? "hidden sm:flex" : "flex"
                        }`}
                      >
                        <span
                          className={`text-left leading-none font-medium truncate ${
                            InsufficientBalance
                              ? "text-red-600"
                              : "text-gray-600"
                          } ${size === "base" ? "text-base" : "text-sm"}`}
                          style={{ marginBottom: "0.15rem" }}
                        >
                          {account.character?.metadata?.content?.name ||
                            getAccountDisplayName(account)}
                        </span>
                        {account.character?.handle && (
                          <span
                            className={`text-left leading-none ${
                              sizeDecrease === "sm" ? "text-sm" : "text-xs"
                            } truncate ${
                              InsufficientBalance
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          >
                            {"@" + account.character?.handle ||
                              getAccountDisplayName(account)}
                          </span>
                        )}
                      </div>
                      <i className="icon-[mingcute--down-line] text-xl ml-[2px]" />
                    </>
                  )}
                </button>
              }
              dropdown={
                <div
                  className={`text-gray-600 bg-white rounded-lg ring-1 ring-border min-w-[140px] shadow-md py-2 ${
                    size === "base" ? "text-base" : "text-sm"
                  } mt-1`}
                >
                  {dropdownLinks.map((link, i) => {
                    return (
                      <UniLink
                        key={i}
                        href={link.url}
                        onClick={link.onClick}
                        className={`${
                          size === "base" ? "pl-5 pr-6 h-11" : "pl-4 pr-5 h-9"
                        } flex items-center w-full whitespace-nowrap hover:bg-hover`}
                        aria-label={link.label}
                      >
                        <span className="mr-2 flex justify-center">
                          <i className={cn(link.icon, "text-base")} />
                        </span>
                        {link.label}
                      </UniLink>
                    )
                  })}
                </div>
              }
            />
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
