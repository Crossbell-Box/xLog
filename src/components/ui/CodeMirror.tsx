import {
  CSSProperties,
  Suspense,
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"

import { HighlightStyle } from "@codemirror/language"
import type { EditorState } from "@codemirror/state"
import { Annotation } from "@codemirror/state"
import { EditorView, KeyBinding, ViewUpdate } from "@codemirror/view"
import { tags } from "@lezer/highlight"

import {
  monospaceFonts,
  useCodeMirrorAutoToggleTheme,
  useCodeMirrorStyle,
} from "~/hooks/useCodemirrorTheme"
import { useIsDark } from "~/hooks/useDarkMode"
import { useGetState } from "~/hooks/useGetState"
import { useIsUnmounted } from "~/hooks/useLifecycle"

const LoadingHolder = () => {
  const { t } = useTranslation("common")
  return (
    <div className="flex-1 h-12 flex items-center justify-center">
      {t("Loading")}...
    </div>
  )
}

interface XLogCodeMirrorEditorProps {
  value?: string
  maxLength?: number
  placeholder?: string
  className?: string
  cmStyle?: Record<string, CSSProperties>
  onChange?: (value: string, viewUpdate: ViewUpdate) => void
  handleDropFile?: (file: File) => void
  onScroll?: (scrollTop: number) => void
  onUpdate?: (update: ViewUpdate) => void
  onCreateEditor?: (view: EditorView, state: EditorState) => void
  onMouseEnter?: () => void
  LoadingComponent?: () => JSX.Element
}

export const CodeMirrorEditor = forwardRef<
  EditorView | null,
  XLogCodeMirrorEditorProps
>((props, ref) => {
  return (
    <Suspense
      fallback={
        props.LoadingComponent ? (
          createElement(props.LoadingComponent)
        ) : (
          <LoadingHolder />
        )
      }
    >
      <LazyCodeMirrorEditor {...props} ref={ref} />
    </Suspense>
  )
})
CodeMirrorEditor.displayName = "CodeMirrorEditor"

const External = Annotation.define<boolean>()

const LazyCodeMirrorEditor = forwardRef<
  EditorView | null,
  XLogCodeMirrorEditorProps
>((props, ref) => {
  const [loading, setLoading] = useState(true)
  const editorElementRef = useRef<HTMLDivElement>(null)
  const isUnmounted = useIsUnmounted()

  const [cmEditor, setCmEditor] = useState<EditorView | null>(null)
  const isDark = useIsDark()

  useCodeMirrorStyle(cmEditor, props.cmStyle)
  useCodeMirrorAutoToggleTheme(cmEditor, isDark)

  useImperativeHandle(ref, () => cmEditor!)

  const { value, handleDropFile, onScroll, onMouseEnter } = props

  const getHandleDropFile = useGetState(handleDropFile)
  const getOnScroll = useGetState(onScroll)
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
        { syntaxHighlighting, indentOnInput },
        // @codemirror/commands
        { defaultKeymap, history, historyKeymap, indentWithTab },
        // @codemirror/language-data
        { languages },
      ] = modules

      const props = getProps()
      const editorState = EditorState.create({
        doc: props.value || "",

        extensions: [
          placeholder(props.placeholder || ""),
          EditorView.updateListener.of((vu) => {
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

              if (props.maxLength && value.length > props.maxLength) {
                return
              }
              onChange(value, vu)
            }
          }),

          indentOnInput(),
          drawSelection(),
          dropCursor(),
          crosshairCursor(),
          history(),

          EditorState.allowMultipleSelections.of(true),

          [EditorView.theme({}), syntaxHighlighting(codeMirrorMarkdownSyntax)],
          ...codemirrorReconfigureExtension,

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

      getProps().onCreateEditor?.(view, editorState)
      setCmEditor(view)
      setLoading(false)
    })
  }, [])

  useEffect(() => () => cmEditor?.destroy(), [cmEditor])

  return (
    <>
      <div
        data-cm-editor
        ref={editorElementRef}
        onMouseEnter={onMouseEnter}
        className={loading ? "" : props.className}
      />
      {loading &&
        (props.LoadingComponent ? (
          createElement(props.LoadingComponent)
        ) : (
          <LoadingHolder />
        ))}
    </>
  )
})

LazyCodeMirrorEditor.displayName = "LazyCodeMirrorEditor"

const markdownTags = [
  tags.heading1,
  tags.heading2,
  tags.heading3,
  tags.heading4,
  tags.heading5,
  tags.heading6,
  tags.strong,
  tags.emphasis,
  tags.deleted,
  tags.content,
  tags.url,
  tags.link,
]

const codeMirrorMarkdownSyntax = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: "1.4em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading2,
    fontSize: "1.3em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading3,
    fontSize: "1.2em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading4,
    fontSize: "1.1em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading5,
    fontSize: "1.1em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading6,
    fontSize: "1.1em",
    fontWeight: "bold",
  },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.deleted, textDecoration: "line-through" },
  { tag: tags.monospace, fontFamily: monospaceFonts },
  {
    tag: markdownTags,
    fontFamily: "var(--font-fans)",
  },
])
