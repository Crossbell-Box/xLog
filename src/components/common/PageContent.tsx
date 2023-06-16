import { type MutableRefObject } from "react"

import { PostActions } from "~/components/site/PostActions"
import { PostToc } from "~/components/site/PostToc"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { renderPageContent } from "~/markdown"

import { PageContentContainer } from "./PageContentContainer"

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
  let inParsedContent
  if (parsedContent) {
    inParsedContent = parsedContent
  } else if (content) {
    inParsedContent = renderPageContent(content, false, isComment)
  }

  return (
    <PageContentContainer
      className={cn("relative", className)}
      page={page}
      onScroll={onScroll}
      onMouseEnter={onMouseEnter}
    >
      <>
        <div className="xlog-post-content prose" ref={inputRef}>
          {inParsedContent?.element}
        </div>
        {toc && inParsedContent?.toc && <PostToc data={inParsedContent?.toc} />}
        {withActions && <PostActions page={page} site={site} />}
      </>
    </PageContentContainer>
  )
}
