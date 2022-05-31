import { FC, useCallback, useEffect, useState } from "react"
import { renderPageContent } from "~/markdown"
import { PageContent } from "../common/PageContent"

export interface EditorPreviewProps {
  className?: string
  content: string
}

export const EditorPreview: FC<EditorPreviewProps> = ({
  className,
  content,
}) => {
  const [html, setHtml] = useState("")
  const renderMarkdown = useCallback(async (doc: string) => {
    const pageContent = await renderPageContent(doc)
    setHtml(pageContent.contentHTML)
  }, [])
  useEffect(() => {
    renderMarkdown(content)
  }, [content, renderMarkdown])
  return <PageContent className={className} contentHTML={html ?? ""} />
}
