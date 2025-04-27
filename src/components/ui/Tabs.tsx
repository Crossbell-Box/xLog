"use client"

import { AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import React from "react"

import { Tab, Tabs, Tooltip } from "@mui/material" // Import Material UI components

import { cn } from "~/lib/utils"

export type TabItem = {
  text: string
  href?: string
  hidden?: boolean
  onClick?: () => void
  active?: boolean
  tooltip?: string
}

export const TabsComponent = ({
  items,
  className,
  type,
}: {
  items: TabItem[]
  className?: string
  type?: "rounded" | "bordered"
}) => {
  const t = useTranslations()
  const pathname = usePathname()

  // Mark active tab based on pathname
  items = items.map((item) => {
    if (item.href) {
      item.active = pathname === item.href
    }
    return item
  })

  if (!items?.length) {
    return null
  }

  return (
    <div className={cn("mb-8", className)}>
      <Tabs
        value={items.findIndex((item) => item.active)} // Material UI Tabs value is index of active tab
        onChange={(event, newValue) =>
          items[newValue].onClick && items[newValue].onClick()
        } // handle tab click
        aria-label="tabs"
        indicatorColor="primary"
        textColor="primary"
        className={cn(
          "overflow-x-auto scrollbar-hide",
          type === "rounded" ? "space-x-3 text-sm" : "space-x-5 border-b",
        )}
      >
        <AnimatePresence>
          {items.map((item, index) => {
            if (item.hidden) return null

            return (
              <Tab
                key={item.text}
                label={
                  item.tooltip ? (
                    <Tooltip title={t(item.tooltip)}>
                      <span>{t(item.text)}</span>
                    </Tooltip>
                  ) : (
                    t(item.text)
                  )
                }
                value={index}
                onClick={item.onClick}
                className={cn(
                  "cursor-pointer transition-colors focus-ring relative",
                  type === "rounded"
                    ? "rounded-full h-8 px-3 transition-colors"
                    : "",
                  item.active
                    ? "text-accent font-medium"
                    : "text-gray-600 hover:text-accent",
                )}
                sx={{
                  "&.Mui-selected": {
                    color: "#3f51b5", // Material UI accent color
                  },
                  "&.MuiTab-root": {
                    minWidth: "auto",
                  },
                }}
              />
            )
          })}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
