import clsx from "clsx"
import React from "react"
import { UniLink } from "./UniLink"

export type TabItem = {
  text: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export const Tabs: React.FC<{ items: TabItem[] }> = ({ items }) => {
  return (
    <div className="flex border-b space-x-5 mb-8">
      {items.map((item) => {
        return (
          <UniLink
            href={item.href}
            onClick={item.onClick}
            key={item.text}
            className={clsx(
              `border-b-2 text-sm inline-flex items-center h-10`,
              item.active
                ? `border-accent text-black font-medium`
                : `text-gray-500  border-transparent hover:border-gray-300`,
            )}
          >
            {item.text}
          </UniLink>
        )
      })}
    </div>
  )
}
