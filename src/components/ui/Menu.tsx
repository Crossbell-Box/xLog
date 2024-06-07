import { AnimatePresence, m } from "framer-motion"
import Link from "next/link"
import React, { Fragment } from "react"

import {
  autoPlacement,
  autoUpdate,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/react"
import { Menu as HeadlessUiMenu } from "@headlessui/react"

import { cn } from "~/lib/utils"

/**
 * A dropdown menu that is opened by clicking on the target element.
 *
 * Use Headless UI for **accessible** interactions,
 * and Floating UI for positioning.
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
    <HeadlessUiMenu>
      <HeadlessUiMenu.Button as={Fragment}>
        {React.cloneElement(target, { ref: refs.setReference })}
      </HeadlessUiMenu.Button>
      <AnimatePresence>
        <HeadlessUiMenu.Items
          className="absolute z-10 w-max"
          ref={refs.setFloating}
          style={floatingStyles}
        >
          <m.div
            className="mt-1 outline-none text-gray-600 bg-white rounded-lg ring-1 ring-border shadow-md py-2"
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
        </HeadlessUiMenu.Items>
      </AnimatePresence>
    </HeadlessUiMenu>
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
    <HeadlessUiMenu.Item>
      {({ active }) => {
        const className = cn(
          "w-full h-10 px-3 flex items-center flex-nowrap",
          {
            "bg-hover": active,
          },
          classNameProp,
        )

        // Can't use <UniLink> here because headlessui Menu.Item assigns `onClick` to its child
        if (props.type === "button") {
          return (
            <button className={className} {...props}>
              {childElement}
            </button>
          )
        }
        if (typeof props.href === "undefined") {
          return <span className={className}>{childElement}</span>
        }

        const isExternal =
          /^https?:\/\//.test(props.href) || props.href.startsWith("/feed")

        if (isExternal) {
          return (
            <a
              className={className}
              target="_blank"
              rel="nofollow noreferrer"
              {...props}
            >
              {childElement}
            </a>
          )
        }

        return (
          <Link className={className} {...props}>
            {childElement}
          </Link>
        )
      }}
    </HeadlessUiMenu.Item>
  )
}

// TODO: Add support for nested menus
// this is a hack submenu use the div and <Menu /> component
// about why i'm not use the headlessui Menu.Item, because it's not support nested menu,
// and it will make the autoPlacement not work properly.
// problem that's will happen is the styles maybe not sync with the <Menu.Item /> component

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
        <div
          className="w-full px-3 flex items-center flex-nowrap 
            pl-5 pr-6 h-11 whitespace-nowrap
            hover:bg-hover
            cursor-pointer select-none
          "
          aria-hidden
        >
          {icon}
          {children}
        </div>
      }
      dropdown={dropdown}
    />
  )
}
