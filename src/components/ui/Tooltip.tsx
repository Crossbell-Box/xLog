"use client"

import { AnimatePresence, m } from "framer-motion"
import { useState } from "react"

import {
  autoUpdate,
  flip,
  offset,
  Placement,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react"

import { cn } from "~/lib/utils"

interface Props {
  label: string | JSX.Element
  placement?: Placement
  children: JSX.Element
  className?: string
  inline?: boolean
  childrenClassName?: string
}

export const Tooltip = ({
  children,
  label,
  placement = "top",
  className,
  childrenClassName,
  inline,
}: Props) => {
  const [open, setOpen] = useState(false)

  const { floatingStyles, refs, context } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    transform: false,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={cn(
          "items-center",
          inline ? "inline-flex" : "flex",
          childrenClassName,
        )}
      >
        {children}
      </div>
      <AnimatePresence>
        {open && (
          <m.div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cn(
              "bg-zinc-600 text-white rounded-lg shadow-lg px-3 py-1 whitespace-nowrap",
              className,
            )}
            initial={{ translateY: "10px", opacity: 0 }}
            animate={{ translateY: "0px", opacity: 1 }}
            exit={{ translateY: "10px", opacity: 0 }}
            {...getFloatingProps()}
          >
            {label}
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
