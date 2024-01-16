import { memo, type MutableRefObject } from "react"

import PostActions from "~/components/site/PostActions"
import PostToc from "~/components/site/PostToc"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { renderPageContent } from "~/markdown"

import { MarkdownContentContainer } from "./MarkdownContentContainer"

const MarkdownContent = memo(function PageContent({
  className,
  content,
  withToc,
  inputRef,
  onScroll,
  onMouseEnter,
  parsedContent,
  isComment,
  page,
  site,
  withActions,
  onlyContent,
}: {
  content?: string
  className?: string
  withToc?: boolean
  inputRef?: MutableRefObject<HTMLDivElement | null>
  onScroll?: (scrollTop: number) => void
  onMouseEnter?: () => void
  parsedContent?: ReturnType<typeof renderPageContent>
  isComment?: boolean
  page?: ExpandedNote
  site?: ExpandedCharacter
  withActions?: boolean
  onlyContent?: boolean
}) {
  let inParsedContent
  if (parsedContent) {
    inParsedContent = parsedContent
  } else if (content) {
    inParsedContent = renderPageContent(content, false, isComment)
  }

  return (
    <MarkdownContentContainer
      className={cn("relative", className)}
      page={page}
      onScroll={onScroll}
      onMouseEnter={onMouseEnter}
    >
      <>
        <div className="xlog-post-content prose" ref={inputRef}>
          {inParsedContent?.element}
        </div>
        {!onlyContent && withToc && inParsedContent?.toc && (
          <PostToc data={inParsedContent?.toc} />
        )}
        {!onlyContent && withActions && <PostActions page={page} site={site} />}
      </>
    </MarkdownContentContainer>
  )
})

export default MarkdownContent
