import { toGateway } from "~/lib/ipfs-parser"

const Style: React.FC<{
  content?: string
  children?: React.ReactNode[]
}> = ({ content, children }) => {
  let css = content
  if (!css && typeof children?.[0] === "string") {
    css = children[0].trim()
  }
  if (!css) {
    return null
  }

  return (
    <link
      type="text/css"
      rel="stylesheet"
      href={
        "data:text/css;base64," + Buffer.from(toGateway(css)).toString("base64")
      }
    />
  )
}

export default Style
