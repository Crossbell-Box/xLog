import {
  createElement,
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands"
import {
  markdown,
  markdownKeymap,
  markdownLanguage,
} from "@codemirror/lang-markdown"
import {
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language"
import { languages } from "@codemirror/language-data"
import { Annotation, EditorState } from "@codemirror/state"
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  KeyBinding,
  keymap,
  placeholder,
  ViewUpdate,
} from "@codemirror/view"
import { tags } from "@lezer/highlight"
import { scroll } from "@uiw/codemirror-extensions-events"

import { mentionAutocompletion } from "~/components/dashboard/toolbars/mention-autocompletion"
import {
  codemirrorReconfigureExtension,
  monospaceFonts,
  useCodeMirrorAutoToggleTheme,
  useCodeMirrorStyle,
} from "~/hooks/useCodemirrorTheme"
import { useIsDark } from "~/hooks/useDarkMode"
import { useGetState } from "~/hooks/useGetState"
import { useIsUnmounted } from "~/hooks/useLifecycle"

import { Loading } from "../common/Loading"

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
  shortcuts?: KeyBinding[]
}

const External = Annotation.define<boolean>()

const CodeMirrorEditor = forwardRef<
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
    if (isUnmounted()) return
    if (!editorElementRef.current) return

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
          ...(props.shortcuts ?? []),
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
        mentionAutocompletion(),
      ],
    })

    const view = new EditorView({
      state: editorState,
      parent: editorElementRef.current,
    })

    getProps().onCreateEditor?.(view, editorState)
    setCmEditor(view)
    setLoading(false)
  }, [])

  useEffect(() => () => cmEditor?.destroy(), [cmEditor])

  return (
    <>
      <div
        data-cm-editor
        ref={editorElementRef}
        onMouseEnter={onMouseEnter}
        className={loading ? "hidden" : props.className}
      />
      {loading &&
        (props.LoadingComponent ? (
          createElement(props.LoadingComponent)
        ) : (
          <Loading className="flex-1 h-12" />
        ))}
    </>
  )
})

CodeMirrorEditor.displayName = "CodeMirrorEditor"

export default CodeMirrorEditor

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
