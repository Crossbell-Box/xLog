"use client"

import dynamic from "next/dynamic"
import { type DPlayerProps } from "rc-dplayer"
import { ReactElement } from "rehype-react/lib"

import { toGateway } from "~/lib/ipfs-parser"

const RcDPlayer = dynamic(async () => (await import("rc-dplayer")).Player)

const DPlayer = function DPlayer({
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
}

export default DPlayer
