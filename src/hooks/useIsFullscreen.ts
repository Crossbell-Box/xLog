import { useCallback, useEffect, useState } from "react"

export function useIsFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const onFullscreenChange = useCallback(() => {
    setIsFullscreen(document.fullscreenElement !== null)
  }, [])
  useEffect(() => {
    setIsFullscreen(document.fullscreenElement !== null)
  }, [])
  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  })
  return isFullscreen
}
