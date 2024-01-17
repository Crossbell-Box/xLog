import { HTMLAttributes, memo } from "react"

import { toGateway } from "~/lib/ipfs-parser"

const Style = memo(function Style({
  children,
}: HTMLAttributes<HTMLStyleElement>) {
  let css: string | null = null
  if (typeof children === "string") {
    css = children.trim()
  } else {
    return null
  }

  return (
    <link
      type="text/css"
      rel="stylesheet"
      href={
        "data:text/css;base64," + Buffer.from(toGateway(css)).toString("base64")
      }
    />
  )
})

export default Style
