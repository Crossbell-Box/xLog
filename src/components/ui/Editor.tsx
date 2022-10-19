import CodeMirror from "@uiw/react-codemirror"
import { EditorView, ViewUpdate } from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { scroll } from "@uiw/codemirror-extensions-events"
import type { EditorState } from "@codemirror/state"
import { useCallback, useState, useEffect, useMemo } from "react"

export const Editor: React.FC<{
  value: string
  onChange?: (value: string, viewUpdate: ViewUpdate) => void
  handleDropFile?: (file: File) => void
  onScroll?: (scrollTop: number) => void
  onUpdate?: (update: ViewUpdate) => void
  onCreateEditor?: (view: EditorView, state: EditorState) => void
  onMouseEnter?: () => void
}> = ({
  value,
  onChange,
  handleDropFile,
  onScroll,
  onUpdate,
  onCreateEditor,
  onMouseEnter,
}) => {
  const [extensions, setExtensions] = useState<any>([])
  useEffect(() => {
    setExtensions([
      markdown(),
      EditorView.theme({
        ".cm-scroller": {
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          overflow: "auto",
          height: "100%",
        },
        ".cm-content": {
          paddingBottom: "600px",
        },
        "&.cm-editor.cm-focused": {
          outline: "none",
        },
        "&.cm-editor": {
          height: "100%",
        },
      }),
      EditorView.domEventHandlers({
        drop(e) {
          const file = e.dataTransfer?.items[0]?.getAsFile()
          if (file) {
            handleDropFile?.(file)
          }
        },
        paste(e) {
          const file = e.clipboardData?.files[0]
          if (file) {
            handleDropFile?.(file)
          }
        },
      }),
      scroll({
        scroll: (evn) => {
          onScroll?.((evn.target as any)?.scrollTop)
        },
      }),
      EditorView.lineWrapping,
    ])
  }, [onScroll, handleDropFile])

  return useMemo(
    () => (
      <CodeMirror
        className="px-5 h-full border-r w-1/2"
        value={value}
        extensions={extensions}
        onCreateEditor={onCreateEditor}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          history: true,
          defaultKeymap: true,
          historyKeymap: true,
          dropCursor: true,
          drawSelection: true,
          indentOnInput: true,
          crosshairCursor: true,
          allowMultipleSelections: true,
          syntaxHighlighting: true,
        }}
        indentWithTab={true}
        onChange={onChange}
        placeholder="Start writing..."
        onUpdate={onUpdate}
        onMouseEnter={onMouseEnter}
      />
    ),
    [value, onChange, extensions, onUpdate, onCreateEditor, onMouseEnter],
  )
}
