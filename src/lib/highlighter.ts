import {
  bundledLanguages,
  bundledThemes,
  getHighlighter,
  type Highlighter,
} from "shiki"

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
