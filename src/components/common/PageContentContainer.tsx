"use client"

import { type MutableRefObject, useEffect } from "react"

import { useCodeCopy } from "~/hooks/useCodeCopy"
import { useHash } from "~/hooks/useHash"
import { ExpandedNote } from "~/lib/types"
import { cn, scrollTo } from "~/lib/utils"
import { useReportStats } from "~/queries/page"

export const PageContentContainer = ({
  className,
  page,
  inputRef,
  onScroll,
  onMouseEnter,
  children,
  element,
}: {
  className?: string
  page?: ExpandedNote
  inputRef?: MutableRefObject<HTMLDivElement | null>
  onScroll?: (scrollTop: number) => void
  onMouseEnter?: () => void
  children?: JSX.Element
  element?: JSX.Element
}) => {
  useCodeCopy()

  const hash = useHash()
  useEffect(() => {
    scrollTo(hash)
  }, [hash])

  useReportStats({
    characterId: page?.characterId,
    noteId: page?.noteId,
  })

  return (
    <div className={cn("relative", className)}>
      <div className="xlog-post-content prose" ref={inputRef}>
        {element}
      </div>
      {children}
    </div>
  )
}
