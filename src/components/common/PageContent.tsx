import clsx from "clsx"
import { useCodeCopy } from "~/hooks/useCodeCopy"

export const PageContent: React.FC<{
  contentHTML: string
  className?: string
}> = ({ contentHTML, className }) => {
  useCodeCopy()

  return (
    <div
      className={clsx("xlog-post-content", `prose`, className)}
      dangerouslySetInnerHTML={{ __html: contentHTML }}
    ></div>
  )
}
