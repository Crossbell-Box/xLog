"use client"

import { AnimatePresence, m } from "framer-motion"
import React, { Fragment } from "react"

import {
  autoPlacement,
  autoUpdate,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/react"
import { ChevronRight } from "@mui/icons-material"
import { Menu as MUI_Menu, MenuItem as MUI_MenuItem } from "@mui/material"

import { cn } from "~/lib/utils"

/**
 * A dropdown menu that is opened by clicking on the target element.
 *
 * Use MUI for **styled components**, and Floating UI for positioning.
 */
export function Menu({
  target,
  dropdown,
  placement = "bottom-start",
  enableAutoPlacement = false,
  allowedPlacements = ["bottom-start"],
}: React.PropsWithChildren<{
  target: JSX.Element
  dropdown: React.ReactNode
  placement?: Placement
  enableAutoPlacement?: boolean
  allowedPlacements?: Placement[]
}>) {
  const { refs, floatingStyles } = useFloating({
    placement,
    middleware: [
      // Prevent overflowing viewport
      shift({ padding: 20 }),
      enableAutoPlacement ? autoPlacement({ allowedPlacements }) : undefined,
    ],
    whileElementsMounted: autoUpdate,
  })

  return (
    <MUI_Menu
      anchorEl={refs.setReference.current}
      open={Boolean(refs.setReference.current)}
      onClose={() => (refs.setReference.current = null)}
      PaperProps={{
        style: floatingStyles,
      }}
    >
      <AnimatePresence>
        <m.div
          initial={{
            translateY: "10px",
            opacity: 0,
          }}
          animate={{
            translateY: "0px",
            opacity: 1,
          }}
          exit={{
            translateY: "10px",
            opacity: 0,
          }}
        >
          {dropdown}
        </m.div>
      </AnimatePresence>
    </MUI_Menu>
  )
}

type MenuItemProps = {
  icon?: React.ReactNode
  className?: string
} & (
  | {
      type: "link"
      href: string
    }
  | {
      type: "button"
      onClick: React.MouseEventHandler
    }
)

Menu.Item = function MenuItem({
  icon,
  children,
  className: classNameProp,
  ...props
}: React.PropsWithChildren<MenuItemProps>) {
  const childElement = (
    <>
      <span
        className="mr-2 fill-gray-500 flex items-center size-4 text-base leading-none"
        aria-hidden
      >
        {icon}
      </span>
      {children}
    </>
  )

  return (
    <MUI_MenuItem
      onClick={props.type === "button" ? props.onClick : undefined}
      component={props.type === "link" ? "a" : "button"}
      className={cn(
        "w-full h-10 px-3 flex items-center flex-nowrap",
        {
          "bg-hover": props.type === "link",
        },
        classNameProp,
      )}
      href={props.type === "link" ? props.href : undefined}
    >
      {childElement}
    </MUI_MenuItem>
  )
}

// SubMenu component to handle nested dropdowns
Menu.SubMenu = function MenuSubMenu({
  icon,
  children,
  dropdown,
}: React.PropsWithChildren<{
  icon: React.ReactNode
  dropdown: React.ReactNode
}>) {
  return (
    <Menu
      placement="right-start"
      enableAutoPlacement
      allowedPlacements={["left-start", "right-start"]}
      target={
        <div className="w-full px-3 flex items-center flex-nowrap pl-5 pr-6 h-11 whitespace-nowrap hover:bg-hover cursor-pointer select-none">
          {icon}
          {children}
          <ChevronRight fontSize="small" />
        </div>
      }
      dropdown={dropdown}
    />
  )
}
