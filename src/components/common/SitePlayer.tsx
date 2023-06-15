"use client"

// @ts-ignore
import APlayer from "aplayer"
import "aplayer/dist/APlayer.min.css"
import { useEffect } from "react"

let siteAPlayer: APlayer

const playerId = "site-aplayer"

// APlayer Container
export const SitePlayerContainer = () => {
  useEffect(() => {
    // Initialize
    siteAPlayer = new APlayer({
      container: document.getElementById(playerId),
      fixed: true,
    })
  }, [])

  return <div id={playerId} />
}

export const useAPlayer = () => {
  return siteAPlayer
}
