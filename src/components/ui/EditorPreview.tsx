import clsx from "clsx"
import { FC, useCallback, useEffect, useState } from "react"
import { renderPageContent } from "~/markdown"

export interface EditorPreviewProps {
  className?: string
  content: string
  previewVisible: boolean
}

export const EditorPreview: FC<EditorPreviewProps> = ({
  className,
  content,
  previewVisible,
}) => {
  const [html, setHtml] = useState("")
  const renderMarkdown = useCallback(async (doc: string) => {
    const pageContent = await renderPageContent(doc)
    setHtml(pageContent.contentHTML)
  }, [])
  useEffect(() => {
    renderMarkdown(content)
  }, [content, renderMarkdown])
  return (
    <div
      className={clsx(
        "prose border-l border-gray-100 overflow-auto",
        className,
        { hidden: !previewVisible },
      )}
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    ></div>
  )
}
