import { useCallback, useEffect, useRef, useState } from "react"
import { EditorState } from "@codemirror/state"
import {
  EditorView,
  keymap,
  type ViewUpdate,
  dropCursor,
  drawSelection,
  crosshairCursor,
  placeholder as placeholderExtension,
} from "@codemirror/view"
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import {
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language"
import { IS_PROD } from "~/lib/constants"

const theme = EditorView.theme({
  ".cm-scroller": {
    fontFamily: "var(--font-sans)",
    fontSize: "1rem",
    overflow: "auto",
    paddingBottom: "200px",
  },
  ".cm-content": {
    minHeight: "400px",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
})

export const useEditor = ({
  value,
  onChange,
  placeholder,
  onDropFile,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onDropFile?: (file: File, view: EditorView) => void
}) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [view, setView] = useState<EditorView | null>(null)

  const initEditor = useCallback(
    (node: HTMLDivElement) => {
      const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
        if (vu.docChanged && typeof onChange === "function") {
          const doc = vu.state.doc
          const value = doc.toString()
          onChange(value)
        }
      })

      const view = new EditorView({
        state: EditorState.create({
          doc: "",
          extensions: [
            keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
            history(),
            dropCursor(),
            drawSelection(),
            indentOnInput(),
            crosshairCursor(),
            EditorState.allowMultipleSelections.of(true),
            updateListener,
            EditorView.lineWrapping,
            markdown(),
            placeholderExtension(placeholder || ""),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            theme,
            EditorView.domEventHandlers({
              drop(e) {
                const file = e.dataTransfer?.items[0]?.getAsFile()
                if (!file) return

                onDropFile?.(file, view)
              },
            }),
          ],
        }),
        parent: node,
      })

      view.focus()

      return view
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, placeholder],
  )

  useEffect(() => {
    const view = node && initEditor(node)
    if (view) {
      setView(view)
    }
    return () => {
      view?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node])

  // Update view state when `value` changed
  useEffect(() => {
    const currentValue = view ? view.state.doc.toString() : ""
    if (view && value !== currentValue) {
      if (!IS_PROD) {
        console.log("updating editor value", value)
      }
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || "" },
      })
    }
  }, [value, view])

  return {
    view,
    editorRef(node: HTMLDivElement) {
      setNode(node)
    },
  }
}
