import { useEffect, useRef, useState } from "react"
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
  placeholder?: string
}> = ({ value, onChange, placeholder }) => {
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
        ],
      }),
      parent: editorRef.current!,
    })

    setView(view)

    return () => {
      view.destroy()
      setView(null)
    }
  }, [onChange, placeholder])

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
