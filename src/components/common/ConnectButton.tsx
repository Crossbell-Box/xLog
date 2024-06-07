"use client"

import { useLocale, useTranslations } from "next-intl"
import React, { useEffect, useState } from "react"

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
  useWalletMintNewCharacterModal,
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
  PlusCircleIcon,
} from "@heroicons/react/24/outline"
import { BellAlertIcon } from "@heroicons/react/24/solid"

import { Avatar } from "~/components/ui/Avatar"
import { Button, type Variant, type VariantColor } from "~/components/ui/Button"
import { Menu } from "~/components/ui/Menu"
import { nameMap } from "~/i18n"
import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"

type HeaderLinkType = {
  icon?: React.ReactNode
  label: string | JSX.Element
  isSubmenu?: boolean
  subMenu?: HeaderLinkType[]
} & (
  | {
      href: string
    }
  | {
      onClick: React.MouseEventHandler
    }
)

export const ConnectButton = ({
  left,
  variant,
  variantColor,
  size = "sm",
  hideNotification,
  mobileSimplification,
  hideName,
}: {
  left?: boolean
  variant?: Variant
  variantColor?: VariantColor
  size?: "base" | "sm"
  hideNotification?: boolean
  mobileSimplification?: boolean
  hideName?: boolean
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

  const locale = useLocale()
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
  const walletMintNewCharacterModal = useWalletMintNewCharacterModal()

  const [InsufficientBalance, setInsufficientBalance] = useState<boolean>(false)
  const t = useTranslations()

  useEffect(() => {
    if (!balance) return

    const balanceValue =
      BigInt(balance.value.toString()) <=
      BigInt("1" + "0".repeat(balance.decimals - 2))

    setInsufficientBalance(balanceValue)
  }, [balance])

  const dropdownLinks: HeaderLinkType[] = [
    account?.character
      ? {
          icon: "i-mingcute-home-1-line",
          label: t("My xLog") || "",
          href: getSiteLink({
            subdomain: account?.character?.handle || "",
          }),
        }
      : {
          icon: "i-mingcute-home-1-line",
          label: t("My xLog") || "",
          onClick: () => walletMintNewCharacterModal.show(),
        },
    {
      icon: "i-mingcute-grid-line",
      label: t("Dashboard") || "",
      href: `${SITE_URL}/dashboard`,
    },
    {
      icon: "i-mingcute-copy-2-line",
      label: t(copyLabelDisplay) || "",
      onClick: (e) => {
        e.preventDefault()
        copyLabel()
      },
    },
    {
      icon: "i-mingcute-translate-2-line",
      isSubmenu: true,
      label: t("Switch Language") || "",
      subMenu: Object.keys(nameMap).map((lo) => ({
        label: nameMap[lo],
        onClick: () => {
          document.cookie = `NEXT_LOCALE=${lo};`
          window.location.reload()
        },
      })),
      onClick: (e) => {
        e.preventDefault()
      },
    },
    ...(account?.type === "wallet"
      ? [
          {
            icon: "i-mingcute-seal-line",
            label: (
              <>
                {t("Operator Sign")} (
                {isOpSignEnabled ? (
                  <FaceSmileIcon className="size-4" />
                ) : (
                  <FaceFrownIcon className="size-4" />
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
            icon: "i-mingcute-currency-euro-line",
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
            icon: "i-mingcute-repeat-line",
            label: t("Switch Characters") || "",
            onClick: selectCharactersModal.show,
          },
        ]
      : [
          {
            icon: "i-mingcute-vip-2-line",
            label: t("Upgrade to Wallet") || "",
            onClick: upgradeAccountModal.show,
          },
        ]),
    {
      icon: "i-mingcute-exit-line",
      label: t("Disconnect") || "",
      onClick: disconnect,
    },
  ]

  const addDropdownLinks: HeaderLinkType[] = [
    {
      icon: "i-mingcute-news-line",
      label: t("New Post") || "",
      href: `${SITE_URL}/dashboard/${account?.character?.handle}/editor?type=post`,
    },
    {
      icon: "i-mingcute-file-line",
      label: t("New Page") || "",
      href: `${SITE_URL}/dashboard/${account?.character?.handle}/editor?type=page`,
    },
    {
      icon: "i-mingcute-ins-line",
      label: t("New Short") || "",
      href: `${SITE_URL}/dashboard/${account?.character?.handle}/editor?type=short`,
    },
    {
      icon: "i-mingcute-cloud-line",
      label: t("New Portfolio") || "",
      href: `${SITE_URL}/dashboard/${account?.character?.handle}/editor?type=portfolio`,
    },
  ]
  // TODO: maybe test this style effect
  if (!ssrReady) return <div aria-hidden></div>

  if (!account)
    return (
      <div>
        <Button
          className="text-accent"
          onClick={openConnectModal}
          style={{ height: avatarSize + "px" }}
          variant={variant || "primary"}
          variantColor={variantColor}
        >
          {t("Connect")}
        </Button>
      </div>
    )

  return (
    <div>
      <div
        className="relative flex items-center -mr-2"
        style={{ height: avatarSize + "px" }}
      >
        {!hideNotification && <Notification />}
        <Menu
          placement="bottom"
          target={
            <PlusCircleIcon
              className={`${
                size === "base" ? "size-6 ml-2" : "size-5 ml-1"
              } text-zinc-500 cursor-pointer hidden sm:block`}
            />
          }
          dropdown={
            <div
              className={`min-w-[140px] ${
                size === "base" ? "text-base" : "text-sm"
              }`}
            >
              {addDropdownLinks.map((link, i) => (
                <ConnectMenuItem link={link} size={size} key={i} />
              ))}
            </div>
          }
        ></Menu>
        <div className="h-full w-[2px] py-1 ml-2">
          <div className="size-full bg-zinc-200 rounded-full"></div>
        </div>
        <Menu
          placement="bottom-end"
          target={
            <button
              className="flex items-center hover:bg-hover transition-colors py-1 px-2 rounded-lg ml-1 focus-visible:outline focus-visible:outline-accent focus-visible:outline-offset-1"
              type="button"
              aria-label="connector"
            >
              <Avatar
                cid={account.character?.characterId}
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
                        InsufficientBalance ? "text-red-600" : "text-gray-600"
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
                          InsufficientBalance ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        {"@" + account.character?.handle ||
                          getAccountDisplayName(account)}
                      </span>
                    )}
                  </div>
                  <i className="i-mingcute-down-line text-xl ml-[2px]" />
                </>
              )}
            </button>
          }
          dropdown={
            <div
              className={`min-w-[140px] ${
                size === "base" ? "text-base" : "text-sm"
              }`}
            >
              {dropdownLinks.map((link, i) => {
                if (link.isSubmenu) {
                  return (
                    <Menu.SubMenu
                      key={i}
                      icon={
                        <i className={cn(link.icon, "text-base mr-2 size-4")} />
                      }
                      dropdown={link.subMenu?.map((subLink, j) => (
                        <ConnectMenuItem link={subLink} size={size} key={j} />
                      ))}
                    >
                      <span>{link.label}</span>
                    </Menu.SubMenu>
                  )
                } else {
                  return <ConnectMenuItem link={link} size={size} key={i} />
                }
              })}
            </div>
          }
        />
      </div>
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
// maybe we could be create a file for this component
function Notification() {
  const showNotificationModal = useShowNotificationModal()
  const { isAllRead } = useNotifications()

  if (isAllRead)
    return (
      <BellIcon
        className="size-6 text-zinc-500 cursor-pointer sm:hover:animate-buzz-out"
        onClick={showNotificationModal}
      />
    )

  return (
    <BellAlertIcon
      className="size-6 text-accent cursor-pointer sm:hover:animate-buzz-out"
      onClick={showNotificationModal}
    />
  )
}
// the all menuItem in this file
// it can just be used in this file, because it's props link is the headerLinkType
function ConnectMenuItem({
  link,
  size,
}: {
  link: HeaderLinkType
  size: "base" | "sm"
}) {
  return (
    <Menu.Item
      icon={<i className={cn(link.icon, "text-base")} />}
      className={`${
        size === "base" ? "pl-5 pr-6 h-11" : "pl-4 pr-5 h-9"
      } whitespace-nowrap`}
      {...("href" in link
        ? {
            type: "link",
            href: link.href,
          }
        : {
            type: "button",
            onClick: link.onClick,
          })}
    >
      {link.label}
    </Menu.Item>
  )
}
