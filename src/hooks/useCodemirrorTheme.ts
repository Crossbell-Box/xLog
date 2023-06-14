import { CSSProperties, useEffect, useMemo, useRef } from "react"

import type { Extension } from "@codemirror/state"
import { Compartment } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light"

import { useIsUnmounted } from "./useLifecycle"

export const monospaceFonts = `"OperatorMonoSSmLig Nerd Font","Cascadia Code PL","FantasqueSansMono Nerd Font","operator mono","Fira code Retina","Fira code","Consolas", Monaco, "Hannotate SC", monospace, -apple-system`

const extensionMap = {
  theme: new Compartment(),
  style: new Compartment(),
}

export const codemirrorReconfigureExtension: Extension[] = [
  extensionMap.theme.of([]),
  extensionMap.style.of([]),
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

const baseCmStyle = {
  ".cm-scroller": {
    fontSize: "1rem",
    overflow: "auto",
    height: "100%",
  },

  "&.cm-editor.cm-focused": {
    outline: "none",
  },
  "&.cm-editor": {
    height: "100%",
    backgroundColor: "transparent",
  },
  ".cm-content": {},
} as Record<string, CSSProperties>

export const useCodeMirrorStyle = (view: EditorView | null, cmStyle?: any) => {
  const isUnmounted = useIsUnmounted()
  const once = useRef(false)

  const mergedCmStyle = useMemo(() => {
    const nextStyle = {} as any
    for (const key in baseCmStyle) {
      nextStyle[key] = {
        ...baseCmStyle[key],
        ...cmStyle?.[key],
      }
    }

    return nextStyle
  }, [cmStyle])

  useEffect(() => {
    if (!view) return
    view.dispatch({
      effects: [
        extensionMap.style.reconfigure(EditorView.theme(mergedCmStyle)),
      ],
    })
  }, [view, mergedCmStyle])

  if (isUnmounted()) return
  if (!once.current) {
    if (!view) return
    view.dispatch({
      effects: [
        extensionMap.style.reconfigure(EditorView.theme(mergedCmStyle)),
      ],
    })
    once.current = true
  }
}
