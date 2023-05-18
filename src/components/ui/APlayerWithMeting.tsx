"use client"

import { APlayer as AplayerReact, AudioInfo } from "aplayer-react"
import "aplayer-react/dist/index.css"
import { memo, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import { MetingAudio, fetchAudioData, parseLink } from "~/lib/meting"

function convertAudio(audio: MetingAudio): AudioInfo {
  return {
    name: audio.title,
    artist: audio.author,
    url: audio.url,
    lrc: audio.lrc,
    cover: audio.pic,
  }
}

const APlayer: React.FC<
  {
    url: string
  } & React.AudioHTMLAttributes<HTMLAudioElement>
> = memo(function APlayer({ url, muted }) {
  const [audio, setAudio] = useState<AudioInfo[]>()

  useEffect(() => {
    if (!url) return
    const meta = parseLink(url)
    if (meta) {
      fetchAudioData(meta)
        .then((data) => {
          setAudio(data.map((item) => convertAudio(item)))
        })
        .catch((e) => {
          toast.error(e.message)
        })
    }
  }, [url])

  // TODO: add a loading skeleton
  if (!audio || audio.length === 0) return null
  return (
    <AplayerReact
      audio={audio}
      volume={1}
      autoPlay={false}
      initialLoop={"none"}
    />
  )
})

export default APlayer
