import { APlayer as AplayerReact } from "aplayer-react"
import { memo } from "react"

import { toGateway } from "~/lib/ipfs-parser"

export const APlayer: React.FC<
  {
    name?: string
    artist?: string
    cover?: string
    lrc?: string
  } & React.AudioHTMLAttributes<HTMLAudioElement>
> = memo(
  function APlayer({ src, name, artist, cover, lrc, muted, autoPlay, loop }) {
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.src === nextProps.src &&
      prevProps.name === nextProps.name &&
      prevProps.artist === nextProps.artist &&
      prevProps.cover === nextProps.cover &&
      prevProps.lrc === nextProps.lrc &&
      prevProps.muted === nextProps.muted &&
      prevProps.autoPlay === nextProps.autoPlay &&
      prevProps.loop === nextProps.loop
    )
  },
)
