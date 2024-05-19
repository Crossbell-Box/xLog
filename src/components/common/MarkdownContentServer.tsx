import MarkdownContent from "./MarkdownContent"

type MarkdownContentServerProps = Omit<
  React.ComponentProps<typeof MarkdownContent>,
  "highlighter"
>

const MarkdownContentServer = async (props: MarkdownContentServerProps) => {
  return <MarkdownContent {...props} />
}

export default MarkdownContentServer
