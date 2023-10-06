import { createContext, PropsWithChildren, useContext, useMemo } from "react"
import { createPortal } from "react-dom"

import { useIsClient } from "~/hooks/useClient"
import { isServerSide } from "~/lib/utils"

export const usePortal = () => {
  const ctx = useContext(RootPortalContext)
  if (isServerSide()) {
    return null
  }
  return ctx.to || document.body
}

const RootPortalContext = createContext<{
  to?: HTMLElement | undefined
}>({
  to: undefined,
})
export const PortalProvider = (
  props: PropsWithChildren<{
    to?: HTMLElement
  }>,
) => (
  <RootPortalContext.Provider
    value={useMemo(
      () => ({
        to: props.to,
      }),
      [props.to],
    )}
  >
    {props.children}
  </RootPortalContext.Provider>
)

export const Portal = (
  props: PropsWithChildren<{
    to?: HTMLElement
  }>,
) => {
  const client = useIsClient()
  const to = usePortal()

  if (!client) return null

  return createPortal(props.children, props.to || to || document.body)
}
