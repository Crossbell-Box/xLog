import { bundledLanguages, bundledThemes, getHighlighter } from "shiki"

import MarkdownContent from "./MarkdownContent"

type MarkdownContentServerProps = Omit<
  React.ComponentProps<typeof MarkdownContent>,
  "highlighter"
>

const MarkdownContentServer = async (props: MarkdownContentServerProps) => {
  const highlighter = await getHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages),
  })
  return <MarkdownContent {...props} highlighter={highlighter} />
}

export default MarkdownContentServer
