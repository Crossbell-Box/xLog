"use client"

import { MutableRefObject, useEffect, useMemo } from "react"

import { PostActions } from "~/components/site/PostActions"
import { PostToc } from "~/components/site/PostToc"
import { useCodeCopy } from "~/hooks/useCodeCopy"
import { useHash } from "~/hooks/useHash"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn, scrollTo } from "~/lib/utils"
import { renderPageContent } from "~/markdown"
import { useReportStats } from "~/queries/page"

export const PageContent = ({
  className,
  content,
  toc,
  inputRef,
  onScroll,
  onMouseEnter,
  parsedContent,
  isComment,
  page,
  site,
  withActions,
}: {
  content?: string
  className?: string
  toc?: boolean
  inputRef?: MutableRefObject<HTMLDivElement | null>
  onScroll?: (scrollTop: number) => void
  onMouseEnter?: () => void
  parsedContent?: ReturnType<typeof renderPageContent>
  isComment?: boolean
  page?: ExpandedNote
  site?: ExpandedCharacter
  withActions?: boolean
}) => {
  useCodeCopy()

  const inParsedContent = useMemo(() => {
    if (parsedContent) {
      return parsedContent
    } else if (content) {
      const result = renderPageContent(content, false, isComment)
      return result
    } else {
      return null
    }
  }, [content, isComment, parsedContent])

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
      <div className="xlog-post-content prose" ref={inputRef}>
        {inParsedContent?.element}
      </div>
      {toc && inParsedContent?.toc && <PostToc data={inParsedContent?.toc} />}
      {withActions && <PostActions page={page} site={site} />}
    </div>
  )
}
