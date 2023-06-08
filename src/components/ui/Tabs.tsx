import React from "react"

import { Tooltip } from "~/components/ui/Tooltip"
import { useTranslation } from "~/lib/i18n/client"
import { cn } from "~/lib/utils"

import { UniLink } from "./UniLink"

export type TabItem = {
  text: string
  href?: string
  hidden?: boolean
  onClick?: () => void
  active?: boolean
  tooltip?: string
}

export const Tabs = ({
  items,
  className,
}: {
  items: TabItem[]
  className?: string
}) => {
  const { t } = useTranslation("dashboard")

  return (
    <div
      className={cn(
        className,
        "flex border-b space-x-5 mb-8 overflow-x-auto scrollbar-hide",
      )}
    >
      {items.map((item) => {
        if (item.hidden) return null

        return (
          <UniLink
            href={item.href}
            onClick={item.onClick}
            key={item.text}
            className={cn(
              `border-b-2 inline-flex items-center h-10 whitespace-nowrap cursor-pointer`,
              item.active
                ? `border-accent text-black font-medium`
                : `text-gray-500  border-transparent hover:border-gray-300`,
            )}
          >
            {item.tooltip ? (
              <Tooltip label={item.tooltip}>
                <>{t(item.text)}</>
              </Tooltip>
            ) : (
              <>{t(item.text)}</>
            )}
          </UniLink>
        )
      })}
    </div>
  )
}
