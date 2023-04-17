import { Annotation } from "@codemirror/state"
import type { EditorState } from "@codemirror/state"

import type { ViewUpdate, EditorView, KeyBinding } from "@codemirror/view"
import {
  FC,
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import {
  useCodeMirrorAutoToggleTheme,
  useCodeMirrorStyle,
} from "~/hooks/useCodemirrorTheme"
import { useIsDark } from "~/hooks/useDarkMode"
import { useGetState } from "~/hooks/useGetState"
import { useIsUnmounted } from "~/hooks/useLifecycle"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"

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

const External = Annotation.define<boolean>()

const LazyCodeMirrorEditor = forwardRef<
  EditorView | null,
  XLogCodeMirrorEditorProps
>((props, ref) => {
  const [loading, setLoading] = useState(true)
  const editorElementRef = useRef<HTMLDivElement>(null)
  const isUnmounted = useIsUnmounted()
  const { t } = useTranslation("dashboard")
  const isMobileLayout = useIsMobileLayout()

  const [cmEditor, setCmEditor] = useState<EditorView | null>(null)
  useCodeMirrorStyle(cmEditor)
  const isDark = useIsDark()
  useCodeMirrorAutoToggleTheme(cmEditor, isDark)

  useImperativeHandle(ref, () => cmEditor!)

  const { value, handleDropFile, onScroll, onMouseEnter } = props

  const getHandleDropFile = useGetState(handleDropFile)
  const getOnScroll = useGetState(onScroll)
  const getValue = useGetState(value)
  const getProps = useGetState(props)

  useEffect(() => {
    if (!cmEditor) return
    if (value === undefined) {
      return
    }
    const currentValue = cmEditor ? cmEditor.state.doc.toString() : ""
    if (cmEditor && value !== currentValue) {
      cmEditor.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || "" },
        annotations: [External.of(true)],
      })
    }
  }, [value, cmEditor])

  useEffect(() => {
    Promise.all([
      import("@codemirror/state"),
      import("@codemirror/view"),
      import("@codemirror/lang-markdown"),
      import("@uiw/codemirror-extensions-events"),
      import("~/hooks/useCodemirrorTheme"),
      import("@codemirror/language"),
      import("@codemirror/commands"),
      import("@codemirror/language-data"),
    ]).then((modules) => {
      if (isUnmounted()) return
      if (!editorElementRef.current) return
      const [
        // @codemirror/state
        { EditorState },
        // @codemirror/view
        {
          EditorView,
          dropCursor,
          drawSelection,
          crosshairCursor,
          keymap,
          placeholder,
        },
        // @codemirror/lang-markdown
        { markdown, markdownKeymap, markdownLanguage },
        // @uiw/codemirror-extensions-events
        { scroll },
        { codemirrorReconfigureExtension },
        // @codemirror/language
        { syntaxHighlighting, indentOnInput, defaultHighlightStyle },
        // @codemirror/commands
        { defaultKeymap, history, historyKeymap, indentWithTab },
        // @codemirror/language-data
        { languages },
      ] = modules

      const editorState = EditorState.create({
        doc: getValue(),

        extensions: [
          placeholder(t("Start writing...") || ""),
          EditorView.updateListener.of((vu) => {
            const props = getProps()
            const { onUpdate, onChange } = props
            onUpdate?.(vu)

            if (
              vu.docChanged &&
              typeof onChange === "function" &&
              // Fix echoing of the remote changes:
              // If transaction is market as remote we don't have to call `onChange` handler again
              !vu.transactions.some((tr) => tr.annotation(External))
            ) {
              const doc = vu.state.doc
              const value = doc.toString()
              onChange(value, vu)
            }
          }),

          indentOnInput(),
          drawSelection(),
          dropCursor(),
          crosshairCursor(),
          history(),

          EditorState.allowMultipleSelections.of(true),

          ...codemirrorReconfigureExtension,
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
          }),

          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...markdownKeymap,
            indentWithTab,
          ] as KeyBinding[]),

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

  useEffect(() => () => cmEditor?.destroy(), [cmEditor])

  return (
    <>
      <div
        ref={editorElementRef}
        onMouseEnter={onMouseEnter}
        className={`h-full ${
          isMobileLayout ? "w-full" : "border-r w-1/2 px-5"
        }`}
      />
      {loading && <div>{t("Loading")}...</div>}
    </>
  )
})

LazyCodeMirrorEditor.displayName = "LazyCodeMirrorEditor"
