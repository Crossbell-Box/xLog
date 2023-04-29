import { useState } from "react"

import {
  Placement,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react"

export const Menu: React.FC<{
  target: JSX.Element
  dropdown: JSX.Element
  placement?: Placement
}> = ({ target, dropdown, placement }) => {
  const [isOpen, setIsOpen] = useState(false)

  const { x, y, strategy, refs, context } = useFloating({
    placement: placement || "bottom-start",
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
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
        {...getReferenceProps({
          className: "flex items-center",
        })}
      >
        {target}
      </div>
      {isMounted && (
        <div
          ref={refs.setFloating}
          className="z-10 w-max"
          style={{
            position: strategy,
            top: y ?? "0",
            left: x ?? "0",
            ...styles,
          }}
          {...getFloatingProps()}
        >
          {dropdown}
        </div>
      )}
    </>
  )
}
