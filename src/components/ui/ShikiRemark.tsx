import { FC, ReactNode } from "react"
import type { BundledTheme } from "shiki/themes"

import { Paper, Typography, useTheme } from "@mui/material"
import { ShikiRender } from "@xlog/shiki"

const ShikiRemark: FC<{
  codeTheme?: {
    light?: BundledTheme
    dark?: BundledTheme
  }
  children?: ReactNode
}> = (props) => {
  const theme = useTheme()
  const code = pickMdAstCode(props)
  const language = pickCodeLanguage(props)

  return (
    <Paper
      elevation={3}
      style={{
        backgroundColor: theme.palette.background.paper,
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <Typography variant="h6" component="h3" style={{ marginBottom: "8px" }}>
        Code Snippet
      </Typography>
      <ShikiRender
        code={code}
        language={language}
        codeTheme={props.codeTheme}
      />
    </Paper>
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
