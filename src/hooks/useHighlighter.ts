import { useEffect, useState } from "react"
import {
  bundledLanguages,
  bundledThemes,
  getHighlighter,
  Highlighter,
} from "shiki"

export function useHighlighter() {
  const [highlighter, setHighlighter] = useState<Highlighter | undefined>()
  useEffect(() => {
    getHighlighter({
      themes: Object.keys(bundledThemes),
      langs: Object.keys(bundledLanguages),
    })
      .then((h) => {
        setHighlighter(h)
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])
  return highlighter
}
