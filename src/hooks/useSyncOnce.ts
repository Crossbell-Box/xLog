import { useRef } from "react"

/**
 * @description `useSyncOnce` is a hook that will run a function once and only once, before the useEffect called, it means before `onMounted`.
 */
export const useBeforeMounted = (fn: () => any) => {
  const onceRef = useRef(false)
  if (onceRef.current) return
  fn()
  onceRef.current = true
}
