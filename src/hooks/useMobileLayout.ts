import { useCallback, useEffect } from "react"
import { create } from "zustand"

const mobileWidth = 1024

const useLayoutStore = create<{
  isMobile: boolean | undefined
}>(() => ({
  isMobile: undefined,
}))

export function useMobileLayout() {
  const calc = useCallback(() => {
    useLayoutStore.setState({
      isMobile: window.innerWidth < mobileWidth,
    })
  }, [])

  useEffect(() => {
    window.addEventListener("resize", calc)
    return () => {
      window.removeEventListener("resize", calc)
    }
  }, [calc])

  useEffect(() => {
    calc()
  }, [])
}

export const useIsMobileLayout = () => useLayoutStore((state) => state.isMobile)
