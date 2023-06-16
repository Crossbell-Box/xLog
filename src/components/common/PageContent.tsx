import dynamic from "next/dynamic"
import { type MutableRefObject } from "react"

import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { renderPageContent } from "~/markdown"

import { PageContentContainer } from "./PageContentContainer"

const DynamicPostActions = dynamic(
  () => import("~/components/site/PostActions"),
)
const DynamicPostToc = dynamic(() => import("~/components/site/PostToc"))

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
        {toc && inParsedContent?.toc && (
          <DynamicPostToc data={inParsedContent?.toc} />
        )}
        {withActions && <DynamicPostActions page={page} site={site} />}
      </>
    </PageContentContainer>
  )
}
