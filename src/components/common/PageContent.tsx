import clsx from "clsx"
import { useCodeCopy } from "~/hooks/useCodeCopy"

export const PageContent: React.FC<{
  contentHTML: string
  className?: string
}> = ({ contentHTML, className }) => {
  useCodeCopy()

  return (
    <div
      xlog-label="post-content"
      className={clsx(`prose`, className)}
      dangerouslySetInnerHTML={{ __html: contentHTML }}
    ></div>
  )
}
