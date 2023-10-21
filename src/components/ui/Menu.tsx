import Link from "next/link"
import React, { Fragment } from "react"

import { autoUpdate, Placement, shift, useFloating } from "@floating-ui/react"
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
}: React.PropsWithChildren<{
  target: JSX.Element
  dropdown: React.ReactNode
  placement?: Placement
}>) {
  const { refs, floatingStyles } = useFloating({
    placement,
    middleware: [
      // Prevent overflowing viewport
      shift({ padding: 20 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  return (
    <HeadlessUiMenu>
      <HeadlessUiMenu.Button as={Fragment}>
        {React.cloneElement(target, { ref: refs.setReference })}
      </HeadlessUiMenu.Button>
      <HeadlessUiMenu.Items
        ref={refs.setFloating}
        className={cn(
          "absolute z-10 mt-1 w-max outline-none text-gray-600 bg-white rounded-lg ring-1 ring-border shadow-md py-2",
        )}
        style={floatingStyles}
      >
        {dropdown}
      </HeadlessUiMenu.Items>
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
        className="mr-2 fill-gray-500 flex items-center w-4 h-4 text-base leading-none"
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
