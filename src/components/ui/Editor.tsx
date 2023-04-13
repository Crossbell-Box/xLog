import CodeMirror from "@uiw/react-codemirror"
import { EditorView, ViewUpdate } from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { scroll } from "@uiw/codemirror-extensions-events"
import type { EditorState } from "@codemirror/state"
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "next-i18next"
import { useMobileLayout } from "~/hooks/useMobileLayout"
import {
  codemirrorReconfigureExtension,
  useCodeMirrorAutoToggleTheme,
} from "~/hooks/useCodemirrorTheme"
import { useMediaStore } from "~/hooks/useDarkMode"

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
  const { t } = useTranslation("dashboard")
  const [extensions, setExtensions] = useState<any>([])
  const isMobileLayout = useMobileLayout()
  const [editor, setCmEditor] = useState<EditorView | null>(null)
  const isDark = useMediaStore((state) => state.isDark)
  useCodeMirrorAutoToggleTheme(editor, isDark)

  useEffect(() => {
    setExtensions([
      markdown(),
      EditorView.theme({
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
      }),
      EditorView.domEventHandlers({
        drop(e) {
          const items = Array.from(e.dataTransfer?.items || [])
          {
            ;(async () => {
              for (let i = 0; i < items.length; i++) {
                const file = items[i]?.getAsFile()
                if (file) {
                  await handleDropFile?.(file)
                }
              }
            })()
          }
        },
        paste(e) {
          const files = e.clipboardData?.files
          if (files) {
            const items = Array.from(files)
            {
              ;(async () => {
                for (let i = 0; i < items.length; i++) {
                  await handleDropFile?.(items[i])
                }
              })()
            }
          }
        },
      }),
      scroll({
        scroll: (evn) => {
          onScroll?.((evn.target as any)?.scrollTop)
        },
      }),
      EditorView.lineWrapping,
      ...codemirrorReconfigureExtension,
    ])
  }, [onScroll, handleDropFile])

  return useMemo(
    () => (
      <CodeMirror
        className={`h-full ${
          isMobileLayout ? "w-full" : "border-r w-1/2 px-5"
        }`}
        value={value}
        extensions={extensions}
        onCreateEditor={(view, state) => {
          setCmEditor(view)
          onCreateEditor?.(view, state)
        }}
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
        placeholder={t("Start writing...") || ""}
        onUpdate={onUpdate}
        onMouseEnter={onMouseEnter}
      />
    ),
    [value, onChange, extensions, onUpdate, onCreateEditor, onMouseEnter],
  )
}
