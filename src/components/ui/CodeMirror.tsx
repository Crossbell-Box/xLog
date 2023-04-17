import type { EditorState } from "@codemirror/state"
import { Annotation } from "@codemirror/state"

import { HighlightStyle } from "@codemirror/language"
import { EditorView, KeyBinding, ViewUpdate } from "@codemirror/view"
import { tags } from "@lezer/highlight"
import {
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

export const CodeMirrorEditor = forwardRef<
  EditorView | null,
  XLogCodeMirrorEditorProps
>((props, ref) => {
  const { t } = useTranslation("common")
  return (
    <Suspense fallback={<div>{t("Loading")}...</div>}>
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
  const { t } = useTranslation("dashboard")
  const isMobileLayout = useIsMobileLayout()

  const [cmEditor, setCmEditor] = useState<EditorView | null>(null)
  const isDark = useIsDark()

  useCodeMirrorStyle(cmEditor)
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
        { syntaxHighlighting, indentOnInput },
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

const monoSpaceTags = [
  tags.keyword,
  tags.character,
  tags.propertyName,
  tags.macroName,
  tags.function(tags.variableName),
  tags.labelName,
  tags.definition(tags.name),
  tags.typeName,
  tags.annotation,
  tags.modifier,
  tags.self,
  tags.namespace,
  tags.comment,
  tags.bool,
  /*@__PURE__*/ tags.special(tags.variableName),
  tags.className,
  tags.number,
  tags.changed,
  tags.operator,
  tags.operatorKeyword,
  tags.escape,
  tags.regexp,
  /*@__PURE__*/ tags.special(tags.string),
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
  ...monoSpaceTags.map((tag) => ({
    tag,
    fontFamily: `"OperatorMonoSSmLig Nerd Font","Cascadia Code PL","FantasqueSansMono Nerd Font","operator mono","Fira code Retina","Fira code","Consolas", Monaco, "Hannotate SC", monospace, -apple-system`,
  })),
])
