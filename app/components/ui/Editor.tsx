import { useEffect, useRef, useState } from "react"
import { EditorState } from "@codemirror/state"
import { EditorView, keymap, ViewUpdate } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { history } from "@codemirror/history"

const theme = EditorView.theme({
  ".cm-scroller": {
    fontFamily: "var(--font-sans)",
    fontSize: "1rem",
    overflow: "auto",
  },
  ".cm-content": {
    minHeight: "400px",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
})

export const Editor: React.FC<{
  value: string
  onChange: (value: string) => void
}> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [view, setView] = useState<EditorView | null>(null)

  useEffect(() => {
    const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
      if (vu.docChanged && typeof onChange === "function") {
        const doc = vu.state.doc
        const value = doc.toString()
        onChange(value)
      }
    })

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          keymap.of([indentWithTab]),
          markdown(),
          history(),
          updateListener,
          EditorView.lineWrapping,
          theme,
        ],
      }),
      parent: editorRef.current!,
    })

    setView(view)

    return () => {
      view.destroy()
      setView(null)
    }
  }, [])

  // Update view state when `value` changed
  useEffect(() => {
    const currentValue = view ? view.state.doc.toString() : ""
    if (view && value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || "" },
      })
    }
  }, [value, view])

  return <div ref={editorRef}></div>
}
