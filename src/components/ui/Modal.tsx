"use client"

import React, { Fragment, forwardRef } from "react"

import { Dialog, Transition } from "@headlessui/react"

import { cn } from "~/lib/utils"

interface ModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  title?: string | React.ReactNode
  titleIcon?: React.ReactNode
  size?: "md" | "lg" | "sm"
  zIndex?: number
  panelClassName?: string
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
    },
    ref,
  ) => {
    return (
      <Transition appear show={open} as={Fragment}>
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
            className="fixed inset-0 flex items-center justify-center p-8 z-40"
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
                  `mx-auto rounded-lg bg-white w-full shadow-modal max-h-full overflow-y-auto flex flex-col`,
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
                      className="absolute right-1 w-7 h-7 text-xl cursor-pointer bg-white flex items-center justify-center"
                      onClick={() => setOpen(false)}
                    >
                      <i className="icon-[mingcute--close-line] inline-block" />
                    </span>
                  </Dialog.Title>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    )
  },
)

Modal.displayName = "Modal"
