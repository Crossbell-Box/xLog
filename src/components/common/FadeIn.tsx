"use client"

import { useInViewport } from "ahooks"
import { useEffect, useRef, useState } from "react"

import { cn } from "~/lib/utils"

const FadeIn = ({
  children,
  className,
  ...props
}: {
  children?: JSX.Element | JSX.Element[]
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView] = useInViewport(ref)

  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!locked && isInView === true) {
      setLocked(true)
    }
  }, [isInView])

  return (
    <span
      ref={ref}
      className={cn(
        "block transition-[opacity,transform] duration-800 ease-in-out",
        isInView === false && !locked
          ? // @see https://www.debugbear.com/blog/opacity-animation-poor-lcp
            "opacity-[0.00001] translate-y-[20%]"
          : "opacity-100 translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default FadeIn
