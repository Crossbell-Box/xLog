"use client"

// @ts-ignore
import type APlayer from "aplayer"

let siteAPlayer: APlayer

const playerId = "site-aplayer"

// APlayer Container
export const SitePlayerContainer = () => {
  return <div id={playerId} />
}

export interface AudioInfo {
  name?: string
  artist?: string
  cover?: string
  lrc?: string
  url: string
}

export const sitePlayerAddToPlaylist = async (audio: AudioInfo) => {
  // Check if player is initialized
  if (!siteAPlayer) {
    // @ts-ignore
    const APlayer = (await import("aplayer")).default
    // @ts-ignore
    await import("aplayer/dist/APlayer.min.css")
    siteAPlayer = new APlayer({
      container: document.getElementById(playerId),
      fixed: true,
      listFolded: false,
    })
  }
  // Add
  siteAPlayer.list.add(audio)
}

export const sitePlayerPlayNow = async (audio: AudioInfo) => {
  // Add to playlist
  await sitePlayerAddToPlaylist(audio)
  // Play now
  siteAPlayer.list.switch(siteAPlayer.list.audios.length - 1)
  siteAPlayer.play()
}
