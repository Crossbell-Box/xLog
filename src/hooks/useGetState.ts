import { useEffect, useRef } from "react"

export const useGetState = (state: any) => {
  const ref = useRef(state)

  useEffect(() => void (ref.current = state), [state])
  return () => ref.current
}
