import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { pick } from "~/lib/utils"

import { useRefValue } from "./useRefValue"

interface RouterNavigationEvent {}

type RouterEventFunction = (e: RouterNavigationEvent) => void

const createRegister = () => {
  const props = {
    onStartQ: [] as RouterEventFunction[],
    // onErrorQ: [] as RouterEventFunction[],
    onCompleteQ: [] as RouterEventFunction[],
  } as {
    onStartQ: RouterEventFunction[]
    // onErrorQ: RouterEventFunction[]
    onCompleteQ: RouterEventFunction[]
    onStart: (cb: RouterEventFunction) => () => void
    // onError: (cb: RouterEventFunction) => () => void
    onComplete: (cb: RouterEventFunction) => () => void
  }
  props.onStart = (cb: RouterEventFunction) => {
    props.onStartQ.push(cb)
    return () => {
      props.onStartQ = props.onStartQ.filter(($) => $ !== cb)
    }
  }

  props.onComplete = (cb: RouterEventFunction) => {
    props.onCompleteQ.push(cb)
    return () => {
      props.onCompleteQ = props.onCompleteQ.filter(($) => $ !== cb)
    }
  }

  return props
}

// TODO detect error event
export const useAppRouterEventerListener = () => {
  const [isRouterComplete, setIsRouterComplete] = useState(false)

  const startChangeCallback = () => {
    setIsRouterComplete(false)
    eventsRegisters.onStartQ.forEach(($) => $(buildEvent()))
  }
  const router = useRouter()
  useEffect(() => {
    const rawPush = router.push
    const rawReplace = router.replace

    // const popstateHandler = () => {
    //   startChangeCallback()
    // }

    // window.addEventListener("popstate", popstateHandler)

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

      // window.removeEventListener("popstate", popstateHandler)
    }
  }, [])

  const eventsRegisters = useRefValue(createRegister)

  const buildEvent = (): RouterNavigationEvent => {
    return {
      url: location.pathname + location.search,
    }
  }

  useEffect(() => {
    if (!isRouterComplete) return

    eventsRegisters.onCompleteQ.forEach(($) => $(buildEvent()))
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

  return pick(eventsRegisters, ["onStart", "onComplete"])
}
