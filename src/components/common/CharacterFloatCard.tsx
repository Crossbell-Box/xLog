import { useState } from "react"
import {
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
import { CharacterCard } from "~/components/common/CharacterCard"

export const CharacterFloatCard: React.FC<{
  siteId?: string
  children: JSX.Element
}> = ({ siteId, children }) => {
  const [open, setOpen] = useState(false)

  const { x, y, refs, strategy, context } = useFloating({
    placement: "bottom-start",
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay: { close: 200, open: 200 } }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const { isMounted, styles } = useTransitionStyles(context, {
    duration: 100,
  })

  const [buttonLoading, setButtonLoading] = useState(false)

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isMounted && (
        <div
          ref={refs.setFloating}
          className={
            "z-10 block w-80" + (open || buttonLoading ? "" : " hidden")
          }
          style={{
            position: strategy,
            top: y ?? "0",
            left: x ?? "0",
            ...styles,
          }}
          {...getFloatingProps()}
        >
          <CharacterCard
            siteId={siteId}
            open={open}
            setButtonLoading={setButtonLoading}
          />
        </div>
      )}
    </>
  )
}
