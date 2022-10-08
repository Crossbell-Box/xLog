import clsx from "clsx"
import { useCodeCopy } from "~/hooks/useCodeCopy"
import { renderPageContent } from "~/markdown"
import { PostToc } from "~/components/site/PostToc"

export const PageContent: React.FC<{
  content?: string
  className?: string
  toc?: boolean
}> = ({ className, content, toc }) => {
  useCodeCopy()

  let parsedContent: ReturnType<typeof renderPageContent> | null = null
  if (content) {
    parsedContent = renderPageContent(content)
  }

  return (
    <>
      <div className={clsx("relative xlog-post-content prose", className)}>
        {parsedContent?.element}
      </div>
      {toc && parsedContent?.toc && <PostToc data={parsedContent?.toc} />}
    </>
  )
}
