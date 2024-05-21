import { type FC, type ReactNode } from "react"
import type { BundledTheme } from "shiki/themes"

import { ShikiRender } from "@xlog/shiki"

const ShikiRemark: FC<{
  codeTheme?: {
    light?: BundledTheme
    dark?: BundledTheme
  }
  children?: ReactNode
}> = (props) => {
  const code = pickMdAstCode(props)
  const language = pickCodeLanguage(props)

  return (
    <ShikiRender code={code} language={language} codeTheme={props.codeTheme} />
  )
}

const pickMdAstCode = (props: any) => {
  return props.children.type === "code"
    ? (props.children.props.children as string)
    : ""
}

const pickCodeLanguage = (props: any) => {
  const className =
    props.children.type === "code"
      ? (props.children.props.className as string)
      : ""

  if (className?.includes("language-")) {
    return className.replace("language-", "")
  }
  return ""
}

export default ShikiRemark
