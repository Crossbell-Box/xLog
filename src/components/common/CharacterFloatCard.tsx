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
} from "@floating-ui/react-dom-interactions"
import { CharacterCard } from "~/components/common/CharacterCard"

export const CharacterFloatCard: React.FC<{
  siteId?: string
  children: JSX.Element
}> = ({ siteId, children }) => {
  const [open, setOpen] = useState(false)

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: "bottom-start",
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay: { close: 200, open: 200 } }),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const [buttonLoading, setButtonLoading] = useState(false)

  return (
    <span {...getReferenceProps({ ref: reference, ...children.props })}>
      {children}
      {
        <span
          {...getFloatingProps({
            ref: floating,
            className:
              "z-10 block w-80" + (open || buttonLoading ? "" : " hidden"),
            style: {
              position: strategy,
              top: y ?? "0",
              left: x ?? "0",
            },
          })}
        >
          <CharacterCard
            siteId={siteId}
            open={open}
            setButtonLoading={setButtonLoading}
          />
        </span>
      }
    </span>
  )
}
