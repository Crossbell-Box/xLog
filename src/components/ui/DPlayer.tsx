"use client"

import { DPlayerProps, Player as RcDPlayer } from "rc-dplayer"
import { memo } from "react"
import { ReactElement } from "rehype-react/lib"

import { toGateway } from "~/lib/ipfs-parser"

const DPlayer = memo(function DPlayer({
  src,
  children,
  ...props
}: {
  src?: string
  children?: ReactElement[]
} & DPlayerProps) {
  const sources = children?.filter(
    (child) =>
      child && typeof child.type === "string" && child.type === "source",
  )

  if (!src) {
    src = (sources?.[0]?.props as DPlayerProps)?.src as string
  }

  if (!src) {
    return null
  }

  src = toGateway(src)

  return (
    <div className="my-8">
      <RcDPlayer src={src} {...props} />
    </div>
  )
})

export default DPlayer
