"use client"

import { AnimatePresence, m } from "framer-motion"
import { useState } from "react"

import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react"

import { CharacterCard } from "~/components/common/CharacterCard"

import { Portal } from "./Portal"

export const CharacterFloatCard = ({
  siteId,
  children,
}: {
  siteId?: string
  children: JSX.Element
}) => {
  const [open, setOpen] = useState(false)

  const { floatingStyles, refs, context } = useFloating({
    placement: "bottom-start",
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    transform: false,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay: { close: 200, open: 200 } }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const [buttonLoading, setButtonLoading] = useState(false)

  return (
    <>
      <span
        className="inline-block"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <Portal>
            <m.span
              ref={refs.setFloating}
              className={
                "z-10 block w-80" + (open || buttonLoading ? "" : " hidden")
              }
              style={floatingStyles}
              {...getFloatingProps()}
              initial={{ translateY: "10px", opacity: 0 }}
              animate={{ translateY: "0px", opacity: 1 }}
              exit={{ translateY: "10px", opacity: 0 }}
            >
              <CharacterCard
                siteId={siteId}
                open={open}
                setButtonLoading={setButtonLoading}
              />
            </m.span>
          </Portal>
        )}
      </AnimatePresence>
    </>
  )
}
