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
    <div
      ref={ref}
      className={cn(
        className,
        "transition-[opacity,transform] duration-800 ease-in-out",
        isInView === false && !locked
          ? "opacity-0 translate-y-[20%]"
          : "opacity-1 translate-y-0",
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default FadeIn
