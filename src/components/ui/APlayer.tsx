import { APlayer as AplayerReact } from "aplayer-react"
import { toGateway } from "~/lib/ipfs-parser"

export const APlayer: React.FC<
  {
    name?: string
    artist?: string
    cover?: string
    lrc?: string
  } & React.AudioHTMLAttributes<HTMLAudioElement>
> = ({ src, name, artist, cover, lrc, muted, autoPlay, loop }) => {
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
}
