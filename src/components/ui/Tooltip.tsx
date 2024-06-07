"use client"

import { AnimatePresence, m } from "framer-motion"
import { useCallback, useMemo, useState } from "react"
import { flushSync } from "react-dom"

import {
  autoUpdate,
  flip,
  offset,
  Placement,
  shift,
  size,
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
  debug?: string
}

export const Tooltip = ({
  children,
  label,
  placement = "top",
  className,
  childrenClassName,
  inline,
  debug,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState<number>()

  const { floatingStyles, refs, context } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(5),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ availableHeight }) {
          flushSync(() =>
            setMaxHeight(availableHeight ? availableHeight - 20 : undefined),
          )
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
    transform: false,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const doPopoverDisappear = useCallback(() => {
    if (debug) {
      return
    }
    setOpen(false)
  }, [debug])

  const doPopoverShow = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const listener = useMemo(() => {
    return {
      onMouseOver: doPopoverShow,
      onMouseOut: doPopoverDisappear,
    }
  }, [doPopoverDisappear, doPopoverShow])

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
            style={{ ...floatingStyles, maxHeight }}
            className={cn(
              "bg-zinc-600 text-white rounded-lg shadow-lg px-3 py-1 whitespace-nowrap",
              "overflow-auto",
              className,
            )}
            initial={{ translateY: "10px", opacity: 0 }}
            animate={{ translateY: "0px", opacity: 1 }}
            exit={{ translateY: "10px", opacity: 0 }}
            {...listener}
            {...getFloatingProps()}
          >
            {label}
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
