import { useEffect, useRef } from "react"

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

export const useCodeMirrorStyle = (view: EditorView | null) => {
  const isUnmounted = useIsUnmounted()
  const once = useRef(false)
  const getStyle = () => {
    return {
      ".cm-scroller": {
        fontFamily: monospaceFonts,
        fontSize: "1rem",
        overflow: "auto",
        height: "100%",
        padding: "0 1.25rem",
      },
      ".cm-content": {
        paddingBottom: "600px",
      },
      "&.cm-editor.cm-focused": {
        outline: "none",
      },
      "&.cm-editor": {
        height: "100%",
        backgroundColor: "transparent",
      },
    }
  }

  useEffect(() => {
    if (!view) return
    view.dispatch({
      effects: [extensionMap.style.reconfigure(EditorView.theme(getStyle()))],
    })
  }, [view])

  if (isUnmounted()) return
  if (!once.current) {
    if (!view) return
    view.dispatch({
      effects: [extensionMap.style.reconfigure(EditorView.theme(getStyle()))],
    })
    once.current = true
  }
}
