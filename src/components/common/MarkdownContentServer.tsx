import { createHighlighter } from "~/lib/highlighter"

import MarkdownContent from "./MarkdownContent"

type MarkdownContentServerProps = Omit<
  React.ComponentProps<typeof MarkdownContent>,
  "highlighter"
>

const MarkdownContentServer = async (props: MarkdownContentServerProps) => {
  const highlighter = await createHighlighter()
  return <MarkdownContent {...props} />
}

export default MarkdownContentServer
