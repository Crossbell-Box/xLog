import clsx from "clsx"
import { useCodeCopy } from "~/hooks/useCodeCopy"
import { renderPageContent } from "~/markdown"

export const PageContent: React.FC<{
  content?: string
  className?: string
}> = ({ className, content }) => {
  useCodeCopy()

  // TODO
  // const [element, setElement] = useState<ReactElement>()
  // const renderMarkdown = useCallback((doc: string) => {
  //   setElement(renderPageContent(doc).element)
  // }, [])
  // useEffect(() => {
  //   if (content) {
  //     renderMarkdown(content)
  //   }
  // }, [content, renderMarkdown])

  return (
    <div className={clsx("xlog-post-content", `prose`, className)}>
      {content && renderPageContent(content).element}
    </div>
  )
}
