import { cn } from "~/lib/utils"
import { useCodeCopy } from "~/hooks/useCodeCopy"
import { renderPageContent } from "~/markdown"
import { PostToc } from "~/components/site/PostToc"
import { MutableRefObject, useMemo, useRef } from "react"
import { useMermaid } from "~/hooks/useMermaid"

export const PageContent: React.FC<{
  content?: string
  className?: string
  toc?: boolean
  inputRef?: MutableRefObject<HTMLDivElement | null>
  onScroll?: (scrollTop: number) => void
  onMouseEnter?: () => void
  parsedContent?: ReturnType<typeof renderPageContent>
}> = ({
  className,
  content,
  toc,
  inputRef,
  onScroll,
  onMouseEnter,
  parsedContent,
}) => {
  const $articleRef = useRef<HTMLDivElement>(null)
  useCodeCopy()

  const inParsedContent = useMemo(() => {
    if (parsedContent) {
      return parsedContent
    } else if (content) {
      const result = renderPageContent(content)
      return result
    } else {
      return null
    }
  }, [content, parsedContent])
  useMermaid($articleRef, inParsedContent?.element)

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={onMouseEnter}
      onScroll={(e) => onScroll?.((e.target as any)?.scrollTop)}
      ref={$articleRef}
    >
      <div className="xlog-post-content prose" ref={inputRef}>
        {inParsedContent?.element}
      </div>
      {toc && inParsedContent?.toc && <PostToc data={inParsedContent?.toc} />}
    </div>
  )
}
