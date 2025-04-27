"use client"

import dynamic from "next/dynamic"
import { type DPlayerProps } from "rc-dplayer"

import { Box } from "@mui/material" // Importing Box from Material-UI

import { toGateway } from "~/lib/ipfs-parser"

const RcDPlayer = dynamic(async () => (await import("rc-dplayer")).Player)

const DPlayer = function DPlayer({
  src,
  children,
  ...props
}: {
  src?: string
  children?: JSX.Element[] | JSX.Element
} & DPlayerProps) {
  const sources = Array.isArray(children)
    ? children?.filter(
        (child) =>
          child && typeof child.type === "string" && child.type === "source",
      )
    : []

  if (!src) {
    src = (sources?.[0]?.props as DPlayerProps)?.src as string
  }

  if (!src) {
    return null
  }

  src = toGateway(src)

  return (
    <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
      <RcDPlayer src={src} {...props} />
    </Box>
  )
}

export default DPlayer
