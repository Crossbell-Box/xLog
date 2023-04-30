import clsx from "clsx"
import React, { forwardRef } from "react"

import { Dialog } from "@headlessui/react"

import { cn } from "~/lib/utils"

interface ModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  title?: string | React.ReactNode
  titleIcon?: React.ReactNode
  size?: "md" | "lg" | "sm"
  zIndex?: number
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, setOpen, children, title, titleIcon, size = "md", zIndex }, ref) => {
    return (
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className={clsx("relative", zIndex ? `z-${zIndex}` : "z-10")}
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <div className="fixed inset-0 bg-black/30 z-40" aria-hidden={true} />

        {/* Full-screen container to center the panel */}
        <div
          className={cn(
            `fixed inset-0 flex items-center justify-center p-4 z-40`,
          )}
          ref={ref}
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
        </div>
      </Dialog>
    )
  },
)

Modal.displayName = "Modal"
