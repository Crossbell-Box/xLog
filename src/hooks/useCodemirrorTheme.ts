import type { Extension } from "@codemirror/state"
import { Compartment } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { useEffect, useRef } from "react"

import { oneDark } from "@codemirror/theme-one-dark"
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light"
import { useIsUnmounted } from "./useLifecycle"
import { useIsMobileLayout } from "./useMobileLayout"

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
  const isMobileLayout = useIsMobileLayout()
  const isUnmounted = useIsUnmounted()
  const once = useRef(false)
  const getStyle = () => {
    return {
      ".cm-scroller": {
        fontFamily: "var(--font-sans)",
        fontSize: "1rem",
        overflow: "auto",
        height: "100%",
        padding: isMobileLayout ? "0 1.25rem" : "unset",
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
  }, [view, isMobileLayout])

  if (isUnmounted()) return
  if (!once.current) {
    if (!view) return
    view.dispatch({
      effects: [extensionMap.style.reconfigure(EditorView.theme(getStyle()))],
    })
    once.current = true
  }
}
