import { PropsWithChildren } from "react"
import { createPortal } from "react-dom"

import { useClient } from "~/hooks/useClient"

export const Portal = (props: PropsWithChildren) => {
  const client = useClient()

  if (!client) return null

  return createPortal(props.children, document.body)
}
