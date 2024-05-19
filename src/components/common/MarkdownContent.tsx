import type { Result as TocResult } from "mdast-util-toc"
import { memo, type MutableRefObject } from "react"
import type { BundledTheme } from "shiki/themes"

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
  strictMode,
  page,
  site,
  withActions,
  onlyContent,
  codeTheme,
}: {
  content?: string
  className?: string
  withToc?: boolean
  inputRef?: MutableRefObject<HTMLDivElement | null>
  onScroll?: (scrollTop: number) => void
  onMouseEnter?: () => void
  parsedContent?: ReturnType<typeof renderPageContent>
  strictMode?: boolean
  page?: ExpandedNote
  site?: ExpandedCharacter
  withActions?: boolean
  onlyContent?: boolean
  codeTheme?: {
    light?: BundledTheme
    dark?: BundledTheme
  }
}) {
  let inParsedContent
  if (parsedContent) {
    inParsedContent = parsedContent
  } else if (content) {
    inParsedContent = renderPageContent({
      content,
      strictMode,
      codeTheme,
    })
  }

  let toc: TocResult | undefined = undefined
  if (!onlyContent && withToc) {
    toc = inParsedContent?.toToc()
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
          {inParsedContent?.toElement()}
        </div>
        {toc && <PostToc data={toc} />}
        {!onlyContent && withActions && <PostActions page={page} site={site} />}
      </>
    </MarkdownContentContainer>
  )
})

export default MarkdownContent
