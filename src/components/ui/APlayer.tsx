import { AudioInfo } from "aplayer-react"
import { APlayer as AplayerReact } from "aplayer-react"
import { useEffect, useState } from "react"

export const APlayer: React.FC<
  {
    children: string[]
    src: string
  } & React.HTMLAttributes<HTMLAudioElement>
> = ({ src, children }) => {
  const [audio, setAudio] = useState<AudioInfo>()
  useEffect(() => {
    if (!Array.isArray(children) || children.length < 3) {
      throw new Error("Aplayer params error, exactly 3 parameters required")
    }
    const [artist, name, cover] = children as Array<string>
    setAudio({ artist, name, cover, url: src })
  }, [])

  if (!audio) {
    return null
  } else {
    return <AplayerReact audio={audio} />
  }
}
