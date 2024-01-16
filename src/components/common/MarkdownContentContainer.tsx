"use client"

import { useEffect } from "react"

import { useCodeCopy } from "~/hooks/useCodeCopy"
import { useHash } from "~/hooks/useHash"
import { ExpandedNote } from "~/lib/types"
import { cn, scrollTo } from "~/lib/utils"
import { useReportStats } from "~/queries/page"

export const MarkdownContentContainer = ({
  className,
  page,
  onScroll,
  onMouseEnter,
  children,
}: {
  className?: string
  page?: ExpandedNote
  onScroll?: (scrollTop: number) => void
  onMouseEnter?: () => void
  children?: JSX.Element
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
    <div
      className={cn("relative", className)}
      onMouseEnter={onMouseEnter}
      onScroll={(e) => onScroll?.((e.target as any)?.scrollTop)}
    >
      {children}
    </div>
  )
}
