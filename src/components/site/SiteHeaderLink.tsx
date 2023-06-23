"use client"

import { usePathname } from "next/navigation"

import { useTranslation } from "~/lib/i18n/client"
import { cn } from "~/lib/utils"

import { UniLink } from "../ui/UniLink"

export type HeaderLinkType = {
  icon?: React.ReactNode
  label: string
  url?: string
  onClick?: () => void
}

export const HeaderLink = ({ link }: { link: HeaderLinkType }) => {
  const pathname = usePathname()
  const { t } = useTranslation("site")

  const active = pathname === link.url
  return (
    <UniLink
      href={link.url}
      onClick={link.onClick}
      className={cn("xlog-site-navigation-item", {
        "xlog-site-navigation-item-active": active,
      })}
    >
      {link.icon && <span>{link.icon}</span>}
      <span className="whitespace-nowrap">{t(link.label)}</span>
    </UniLink>
  )
}
