import { useEffect, useState } from "react"
import type { Highlighter } from "shiki"

import { createHighlighter } from "~/lib/highlighter"

export function useHighlighter() {
  const [highlighter, setHighlighter] = useState<Highlighter | undefined>()
  useEffect(() => {
    createHighlighter()
      .then((h) => {
        setHighlighter(h)
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])
  return highlighter
}
