import { cloneElement, useState } from "react"
import {
  Placement,
  offset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  useDismiss,
  useTransitionStyles,
} from "@floating-ui/react"
import { cn } from "~/lib/utils"

interface Props {
  label: string
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

  const { x, y, refs, strategy, context } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const { isMounted, styles } = useTransitionStyles(context, {
    duration: 100,
  })

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
      {isMounted && (
        <div
          ref={refs.setFloating}
          className={cn(
            "bg-zinc-600 text-white rounded-lg shadow-lg px-3 py-1 whitespace-nowrap",
            className,
          )}
          style={{
            position: strategy,
            top: y ?? "0",
            left: x ?? "0",
            ...styles,
          }}
          {...getFloatingProps()}
        >
          {label}
        </div>
      )}
    </>
  )
}
