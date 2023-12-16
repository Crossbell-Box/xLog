"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { memo } from "react"

import {
  sitePlayerAddToPlaylist,
  sitePlayerPlayNow,
} from "~/components/common/SitePlayer"
import { Tooltip } from "~/components/ui/Tooltip"
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
  const t = useTranslations()

  if (!src) return null

  src = toGateway(src)
  if (cover) {
    cover = toGateway(cover)
  }
  if (name) {
    name = name.replace(/^user-content-/, "")
  }

  const audioInfo = {
    name: name || "xLog audio",
    artist: artist || "",
    cover: cover || "/assets/logo.png",
    lrc,
    url: src,
  }

  const addToList = () => {
    sitePlayerAddToPlaylist(audioInfo)
  }

  const playNow = () => {
    sitePlayerPlayNow(audioInfo)
  }

  return (
    <div className="border border-[var(--border-color)] rounded-lg outline-2 outline-transparent flex flex-row gap-4">
      {/*Info*/}
      <div className="flex flex-row grow gap-4">
        {/*Cover*/}
        <div className="shrink-0">
          <Image
            width={72}
            height={72}
            alt={audioInfo.name}
            src={audioInfo.cover}
            className="rounded-l-lg"
          />
        </div>

        {/*Name & Artist*/}
        <div className="flex flex-col justify-center items-center">
          {/*Name*/}
          <div className="font-semibold">{audioInfo.name}</div>

          {/*Artist*/}
          <div className="text-sm">{audioInfo.artist}</div>
        </div>
      </div>

      {/*Control buttons*/}
      <div className="flex flex-row items-center mr-4 gap-3">
        {/*Play Now*/}
        <div>
          <Tooltip label={t("Play")}>
            <button
              onClick={playNow}
              className="p-2 rounded-full bg-accent opacity-90 hover:opacity-100 transition-opacity"
            >
              <i className="i-mingcute-play-fill block text-4xl text-white" />
            </button>
          </Tooltip>
        </div>

        {/*Add to playlist*/}
        <div>
          <Tooltip label={t("Add to playlist")}>
            <button
              onClick={addToList}
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100"
            >
              <i className="i-mingcute-calendar-add-line block text-2xl" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
})

export default APlayer
