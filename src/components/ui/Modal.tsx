"use client"

import { useTranslations } from "next-intl"
import React, { forwardRef, Fragment } from "react"

import { Dialog, Transition } from "@headlessui/react"

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

    return (
      <Transition appear show={open} as={Fragment} afterLeave={afterLeave}>
        <Dialog
          onClose={() => setOpen(false)}
          className="relative"
          style={{
            zIndex: zIndex ? zIndex : 10,
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              aria-hidden={true}
            />
          </Transition.Child>

          <div
            className={cn(
              "fixed inset-0 flex items-center justify-center p-8 z-40",
              boxClassName,
            )}
            ref={ref}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
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
                      className="absolute right-4 w-7 h-7 text-xl cursor-pointer bg-white flex items-center justify-center"
                      onClick={() => setOpen(false)}
                    >
                      <i className="icon-[mingcute--close-line] inline-block" />
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
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    )
  },
)

Modal.displayName = "Modal"
