import { useCallback, useEffect, useState } from "react"

const mobileWidth = 1024

export function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(false)

  const onResize = useCallback(() => {
    setIsMobile(window.innerWidth < mobileWidth)
  }, [])

  useEffect(() => {
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [onResize])

  useEffect(() => {
    setIsMobile(window.innerWidth < mobileWidth)
  }, [])

  return isMobile
}
