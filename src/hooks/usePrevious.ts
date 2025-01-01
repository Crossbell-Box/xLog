import { useEffect, useRef } from "react"

export const usePrevious = <T>(value: T): T => {
  const ref = useRef<T>(undefined)

  useEffect(() => {
    ref.current = value
  })

  return ref.current!
}
