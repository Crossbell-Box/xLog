import { cn } from "~/lib/utils"
import React from "react"
import { UniLink } from "./UniLink"
import { useTranslation } from "next-i18next"

export type TabItem = {
  text: string
  href?: string
  hidden?: boolean
  onClick?: () => void
  active?: boolean
}

export const Tabs: React.FC<{ items: TabItem[] }> = ({ items }) => {
  const { t } = useTranslation(["dashboard"])

  return (
    <div className="flex border-b space-x-5 mb-8 overflow-x-scroll">
      {items.map((item) => {
        if (item.hidden) return null

        return (
          <UniLink
            href={item.href}
            onClick={item.onClick}
            key={item.text}
            className={cn(
              `border-b-2 inline-flex items-center h-10 whitespace-nowrap`,
              item.active
                ? `border-accent text-black font-medium`
                : `text-gray-500  border-transparent hover:border-gray-300`,
            )}
          >
            {t(item.text)}
          </UniLink>
        )
      })}
    </div>
  )
}
