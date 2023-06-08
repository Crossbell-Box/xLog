import React from "react"

import { cn } from "~/lib/utils"

export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <span
      className={cn(
        `relative rounded uppercase bg-yellow-400 text-white h-5 inline-flex items-center px-1 font-semibold text-xs`,
        className,
      )}
    >
      {children}
    </span>
  )
}
