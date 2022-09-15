import { Dialog } from "@headlessui/react"
import clsx from "clsx"
import React from "react"

export const Modal: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  title?: string
  titleIcon?: React.ReactNode
  size?: "md" | "lg" | "sm"
}> = ({ open, setOpen, children, title, titleIcon, size = "md" }) => {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30 z-40" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div
        className={clsx(
          `fixed inset-0 flex items-center justify-center p-4 z-40`,
        )}
      >
        {/* The actual dialog panel  */}
        <Dialog.Panel
          className={clsx(
            `mx-auto rounded-lg bg-white w-full shadow-modal max-h-full overflow-y-auto flex flex-col`,

            size === "md"
              ? `max-w-md`
              : size === "lg"
              ? `max-w-lg`
              : `max-w-sm`,
          )}
        >
          {title && (
            <Dialog.Title className="text-lg border-b h-14 flex items-center px-5 space-x-2 py-4">
              {titleIcon && <span>{titleIcon}</span>}
              <span>{title}</span>
            </Dialog.Title>
          )}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
