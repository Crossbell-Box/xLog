import type { Extension } from "@codemirror/state"
import { Compartment } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { useEffect } from "react"

import { oneDark } from "@codemirror/theme-one-dark"
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light"

const extensionMap = {
  theme: new Compartment(),
}

export const codemirrorReconfigureExtension: Extension[] = [
  extensionMap.theme.of([]),
]

export const useCodeMirrorAutoToggleTheme = (
  view: EditorView | null,
  isDark: boolean,
) => {
  useEffect(() => {
    if (!view) return
    if (isDark) {
      view.dispatch({
        effects: [extensionMap.theme.reconfigure(oneDark)],
      })
    } else {
      view.dispatch({
        effects: [extensionMap.theme.reconfigure(githubLight)],
      })
    }
  }, [view, isDark])
}
