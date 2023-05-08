"use client"

import { FC, PropsWithChildren, useEffect, useRef, useState } from "react"
import { create } from "zustand"

import { useGetState } from "~/hooks/useGetState"

const targetQueue = [] as string[]
interface AnchorStoreState {
  currentTarget: string
  setTarget: (target: string) => void
  pop: () => void
}
const useAnchorStore = create<AnchorStoreState>((setState) => ({
  currentTarget: "",

  setTarget(target: string) {
    if (target === targetQueue.at(-1)) return
    const payload = {
      currentTarget: target,
    }

    targetQueue.push(target)
    setState(payload)
  },

  pop() {
    const prevTarget = targetQueue.pop()
    if (prevTarget) setState({ currentTarget: prevTarget })
  },
}))

export const HeadingAnchor: FC<PropsWithChildren<{ name: string }>> = (
  props,
) => {
  const getName = useGetState(props.name)

  const ref = useRef<HTMLSpanElement>(null)

  const [inViewport, setInViewport] = useState(false)
  useEffect(() => {
    const $el = ref.current
    if (!$el) return

    const options = {
      rootMargin: "-33% 0% -33% 0%",
    }

    const observer = new IntersectionObserver(function (entries, observer) {
      entries.forEach((entry) => {
        setInViewport(entry.isIntersecting)
      })
    }, options)

    observer.observe($el)

    return () => {
      observer.unobserve($el)
      observer.disconnect()
    }
  }, [])

  const isTriggered = useRef(false)

  useEffect(() => {
    const store = useAnchorStore.getState()
    console.log(inViewport, "inViewport", getName())
    if (inViewport) {
      store.setTarget(getName())
      isTriggered.current = true
    } else {
      if (isTriggered.current) {
        store.pop()
      }
      isTriggered.current = false
    }
  }, [inViewport])

  return <span ref={ref} data-anchor className="!inline-block" />
}
