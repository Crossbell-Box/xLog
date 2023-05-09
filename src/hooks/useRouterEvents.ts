import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { pick } from "~/lib/utils"

interface RouterNavigationEvent {}

type RouterEventFunction = (e: RouterNavigationEvent) => void

// TODO detect error event
export const useAppRouterEventerListener = () => {
  const [isRouterComplete, setIsRouterComplete] = useState(false)

  const startChangeCallback = () => {
    setIsRouterComplete(false)
    eventsRegisters.current.onStartQ.forEach(($) => $(buildEvent()))
  }
  const router = useRouter()
  useEffect(() => {
    const rawPush = router.push
    const rawReplace = router.replace

    const popstateHandler = () => {
      startChangeCallback()
    }

    window.addEventListener("popstate", popstateHandler)

    router.push = (...rest) => {
      startChangeCallback()

      // eslint-disable-next-line prefer-spread
      rawPush.apply(null, rest)
    }

    router.replace = (...rest) => {
      startChangeCallback()

      // eslint-disable-next-line prefer-spread
      rawReplace.apply(null, rest)
    }

    return () => {
      router.push = rawPush
      router.replace = rawReplace

      window.removeEventListener("popstate", popstateHandler)
    }
  }, [])

  const eventsRegisters = useRef({
    onStartQ: [] as RouterEventFunction[],
    // onErrorQ: [] as RouterEventFunction[],
    onCompleteQ: [] as RouterEventFunction[],
    onStart(cb: RouterEventFunction) {
      eventsRegisters.current.onStartQ.push(cb)
      return () => {
        eventsRegisters.current.onStartQ =
          eventsRegisters.current.onStartQ.filter(($) => $ !== cb)
      }
    },

    onComplete(cb: RouterEventFunction) {
      eventsRegisters.current.onCompleteQ.push(cb)
      return () => {
        eventsRegisters.current.onCompleteQ =
          eventsRegisters.current.onCompleteQ.filter(($) => $ !== cb)
      }
    },
  })

  const buildEvent = (): RouterNavigationEvent => {
    return {
      url: location.pathname + location.search,
    }
  }

  useEffect(() => {
    if (!isRouterComplete) return

    eventsRegisters.current.onCompleteQ.forEach(($) => $(buildEvent()))
  }, [isRouterComplete])

  const currentPathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (
      currentPathname === location.pathname &&
      searchParams?.toString() ===
        new URLSearchParams(location.search).toString()
    ) {
      setIsRouterComplete(true)
    }
  }, [currentPathname, searchParams])

  return pick(eventsRegisters.current, ["onStart", "onComplete"])
}
