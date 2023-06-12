"use client"

import { APlayer as AplayerReact } from "aplayer-react"
import "aplayer-react/dist/index.css"
import { memo } from "react"

import { toGateway } from "~/lib/ipfs-parser"

const APlayer = memo(function APlayer({
  src,
  name,
  artist,
  cover,
  lrc,
  muted,
  autoPlay,
  loop,
}: {
  name?: string
  artist?: string
  cover?: string
  lrc?: string
} & React.AudioHTMLAttributes<HTMLAudioElement>) {
  if (!src) return null

  src = toGateway(src)
  if (cover) {
    cover = toGateway(cover)
  }
  if (name) {
    name = name.replace(/^user-content-/, "")
  }

  return (
    <AplayerReact
      audio={{
        name: name || "xLog audio",
        artist: artist || "",
        cover: cover || "/assets/logo.png",
        lrc,
        url: src,
      }}
      volume={muted ? 0 : 1}
      autoPlay={autoPlay}
      initialLoop={loop ? "one" : "none"}
    />
  )
})

export default APlayer
