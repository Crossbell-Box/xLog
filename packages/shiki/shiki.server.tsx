import type { FC } from "react"
import {
  bundledLanguages,
  bundledThemes,
  getHighlighter,
  type Highlighter,
} from "shiki"

import { shikiTransformers } from "./shared"
import type { ShikiCodeProps } from "./types"

export const ShikiRender: FC<ShikiCodeProps> = async ({
  code,
  codeTheme,
  language,
}) => {
  const highlighter = await createHighlighter()

  const rendered = highlighter.codeToHtml(code, {
    lang: language || "text",
    themes: codeTheme || {
      light: "github-light-default",
      dark: "github-dark-default",
    },
    transformers: shikiTransformers,
  })

  return <div dangerouslySetInnerHTML={{ __html: rendered }} />
}

let highlighter: Highlighter | undefined

export const createHighlighter = async () => {
  if (!highlighter) {
    highlighter = await getHighlighter({
      themes: Object.keys(bundledThemes),
      langs: Object.keys(bundledLanguages),
    })
  }
  return highlighter
}
