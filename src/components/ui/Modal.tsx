"use client"

import {
  AnimatePresence,
  m,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion"
import { useTranslations } from "next-intl"
import React, { forwardRef } from "react"

import { Dialog } from "@headlessui/react"

import { cn } from "~/lib/utils"

import { Button } from "./Button"

export interface ModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  title?: string | React.ReactNode
  titleIcon?: React.ReactNode
  size?: "md" | "lg" | "sm"
  zIndex?: number
  panelClassName?: string
  boxClassName?: string
  afterLeave?: () => void
  withConfirm?: boolean
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      setOpen,
      children,
      title,
      titleIcon,
      size = "md",
      zIndex,
      panelClassName,
      boxClassName,
      afterLeave,
      withConfirm,
    },
    ref,
  ) => {
    const t = useTranslations()
    const x = useMotionValue(0)

    useMotionValueEvent(x, "animationComplete", () => {
      console.log("animation Complete on x")
      afterLeave?.()
    })

    return (
      <AnimatePresence>
        {open && (
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className="relative"
            style={{
              zIndex: zIndex ? zIndex : 10,
            }}
          >
            <m.div
              className="fixed inset-0 bg-black/25 z-40"
              aria-hidden={true}
              style={{ x }}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />

            <m.div
              className={cn(
                "fixed inset-0 flex items-center justify-center p-8 z-40",
                boxClassName,
              )}
              ref={ref}
              initial={{
                opacity: 0,
                scale: 1.1,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.1,
              }}
            >
              {/* The actual dialog panel  */}
              <Dialog.Panel
                className={cn(
                  `mx-auto rounded-lg bg-white w-full shadow-modal max-h-full flex flex-col`,
                  size === "md"
                    ? `max-w-md`
                    : size === "lg"
                      ? `max-w-lg`
                      : `max-w-sm`,
                  panelClassName,
                )}
              >
                {title && (
                  <Dialog.Title className="text-lg border-b h-14 flex items-center px-5 space-x-2 py-4 relative">
                    {titleIcon && <span>{titleIcon}</span>}
                    <span className="truncate flex items-center w-full">
                      {title}
                    </span>
                    <span
                      className="absolute right-4 size-7 text-xl cursor-pointer bg-white flex items-center justify-center"
                      onClick={() => setOpen(false)}
                    >
                      <i className="i-mingcute-close-line inline-block" />
                    </span>
                  </Dialog.Title>
                )}
                {children}
                {withConfirm && (
                  <Button
                    className="mb-5 mx-auto"
                    onClick={() => setOpen(false)}
                  >
                    {t("Confirm")}
                  </Button>
                )}
              </Dialog.Panel>
            </m.div>
          </Dialog>
        )}
      </AnimatePresence>
    )
  },
)

Modal.displayName = "Modal"
