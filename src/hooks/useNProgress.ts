"use client"

import Progress from "qier-progress"
import { useEffect, useRef } from "react"

import { useAppRouterEventerListener } from "./useRouterEvents"

export const useNProgress = () => {
  const events = useAppRouterEventerListener()

  const instance = useRef(
    new Progress({ color: "var(--theme-color)", colorful: false }),
  )
  useEffect(() => {
    const disposers = [] as any[]

    disposers.push(
      events.onStart(() => {
        instance.current.start()
      }),
    )
    disposers.push(events.onComplete(() => instance.current.finish()))
    return () => disposers.forEach((disposer) => disposer())
  }, [])
}
