import { EditorState } from "@codemirror/state"
import type { ViewUpdate, EditorView } from "@codemirror/view"
import { FC, Suspense, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetState } from "~/hooks/useGetState"
import { useIsUnmounted } from "~/hooks/useLifecycle"

interface XLogCodeMirrorEditorProps {
  value: string
  onChange?: (value: string, viewUpdate: ViewUpdate) => void
  handleDropFile?: (file: File) => void
  onScroll?: (scrollTop: number) => void
  onUpdate?: (update: ViewUpdate) => void
  onCreateEditor?: (view: EditorView, state: EditorState) => void
  onMouseEnter?: () => void
}

export const CodeMirrorEditor: FC<XLogCodeMirrorEditorProps> = (props) => {
  const { t } = useTranslation("common")
  return (
    <Suspense fallback={<div>{t("Loading")}...</div>}>
      <LazyCodeMirrorEditor {...props} />
    </Suspense>
  )
}

const LazyCodeMirrorEditor: FC<XLogCodeMirrorEditorProps> = (props) => {
  const [loading, setLoading] = useState(true)
  const editorElementRef = useRef<HTMLDivElement>(null)
  const isUnmounted = useIsUnmounted()

  const [cmEditor, setCmEditor] = useState<EditorView | null>(null)

  const { value, handleDropFile, onScroll } = props

  const getHandleDropFile = useGetState(handleDropFile)
  const getOnScroll = useGetState(onScroll)
  const getValue = useGetState(value)

  useEffect(() => {
    Promise.all([
      import("@codemirror/state"),
      import("@codemirror/view"),
      import("@codemirror/lang-markdown"),
      import("@uiw/codemirror-extensions-events"),
      import("~/hooks/useCodemirrorTheme"),
      import("@codemirror/language"),
      import("@codemirror/commands"),
    ]).then((modules) => {
      if (isUnmounted()) return
      if (!editorElementRef.current) return
      const [
        // @codemirror/state
        codemirrorState,
        // @codemirror/view
        codemirrorView,
        // @codemirror/lang-markdown
        codemirrorLangMarkdown,
        // @uiw/codemirror-extensions-events
        { scroll },
        { codemirrorReconfigureExtension },
        // @codemirror/language
        { syntaxHighlighting, indentOnInput, defaultHighlightStyle },
        // @codemirror/commands
        { defaultKeymap, history, historyKeymap },
        // @codemirror/autocomplete
      ] = modules
      const { markdown } = codemirrorLangMarkdown
      const { EditorView, dropCursor, drawSelection, crosshairCursor, keymap } =
        codemirrorView
      const editorState = codemirrorState.EditorState.create({
        doc: getValue(),

        extensions: [
          markdown(),
          indentOnInput(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          drawSelection(),
          dropCursor(),
          crosshairCursor(),

          history(),
          EditorState.allowMultipleSelections.of(true),
          // @ts-ignore
          keymap.of([...defaultKeymap, ...historyKeymap]),

          EditorView.domEventHandlers({
            drop(e) {
              const items = Array.from(e.dataTransfer?.items || [])
              {
                ;(async () => {
                  for (let i = 0; i < items.length; i++) {
                    const file = items[i]?.getAsFile()
                    if (file) {
                      getHandleDropFile()?.(file)
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
                      getHandleDropFile()?.(items[i])
                    }
                  })()
                }
              }
            },
          }),
          scroll({
            scroll: (evn) => {
              getOnScroll()?.((evn.target as any)?.scrollTop)
            },
          }),
          EditorView.lineWrapping,
          ...codemirrorReconfigureExtension,
        ],
      })

      const view = new EditorView({
        state: editorState,
        parent: editorElementRef.current,
      })

      setCmEditor(view)
      setLoading(false)
    })
  }, [])

  if (loading) throw Promise.resolve()

  return <div ref={editorElementRef} />
}
