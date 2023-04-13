import { useEffect, useRef } from "react"

export const useIsUnmounted = () => {
  const isUnmounted = useRef(false)
  useEffect(() => {
    return () => {
      isUnmounted.current = true
    }
  }, [])
  return () => isUnmounted.current
}
