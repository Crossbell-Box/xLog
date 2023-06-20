"use client"

// @ts-ignore
import APlayer from "aplayer"
import "aplayer/dist/APlayer.min.css"

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

export const sitePlayerAddToPlaylist = (audio: AudioInfo) => {
  // Check if player is initialized
  if (!siteAPlayer) {
    // Initialize
    siteAPlayer = new APlayer({
      container: document.getElementById(playerId),
      fixed: true,
      listFolded: false,
    })
  }
  // Add
  siteAPlayer.list.add(audio)
}

export const sitePlayerPlayNow = (audio: AudioInfo) => {
  // Add to playlist
  sitePlayerAddToPlaylist(audio)
  // Play now
  siteAPlayer.list.switch(siteAPlayer.list.audios.length - 1)
  siteAPlayer.play()
}
