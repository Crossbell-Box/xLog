import { Dispatch, SetStateAction } from "react"

import { EditorSelection } from "@codemirror/state"
import { type EditorView, type KeyBinding } from "@codemirror/view"

import { AlignCenter } from "./AlignCenter"
import { AlignRight } from "./AlignRight"
import { Bold } from "./Bold"
import { Cloud } from "./Cloud"
import { Code } from "./Code"
import { CodeBlock } from "./CodeBlock"
import { Emoji } from "./Emoji"
import { Focus } from "./Focus"
import { Formula } from "./Formula"
import { Heading } from "./Heading"
import { Help } from "./Help"
import { Italic } from "./Italic"
import { Link } from "./Link"
import { ListOrdered } from "./ListOrdered"
import { ListUnordered } from "./ListUnordered"
import { Mention } from "./Mention"
import { Multimedia } from "./Multimedia"
import { Quote } from "./Quote"
import { ResizeImage } from "./ResizeImage"
import { Strikethrough } from "./Strikethrough"
import { Underline } from "./Underline"

export type ICommand<P = any> = {
  icon: string
  name: string
  label: string
  execute: (_: {
    view: EditorView
    options?: {
      setPreviewVisible?: Dispatch<SetStateAction<boolean>>
      container?: HTMLElement | null
    }
    payload?: P
  }) => void
  // While the `ui` field exists, the ui component will be rendered in a popover first,
  // then you can call `transferPayload` to transfer the payload to the `execute` function.
  // You can find a sample usage in `./Emoji.tsx`.
  ui?: (props: {
    transferPayload: (payload: P) => void
    view: EditorView
  }) => JSX.Element

  shortcut?: KeyBinding
}

export type IPrependExecute = {
  view: EditorView
  prepend: string
}

export const prependExecute = ({ view, prepend }: IPrependExecute) => {
  const range = view.state.selection.ranges[0]
  const selection = view.state.sliceDoc(range.from - prepend.length, range.to)
  if (selection.startsWith(prepend)) {
    view.dispatch(
      view.state.changeByRange((range) => ({
        changes: [
          {
            from: range.from - prepend.length,
            to: range.to,
            insert: view.state.sliceDoc(range.from, range.to),
          },
        ],
        range: EditorSelection.range(
          range.from - prepend.length,
          range.to - prepend.length,
        ),
      })),
    )
    view.focus()
    return
  }
  view.dispatch(
    view.state.changeByRange((range) => {
      return {
        changes: [{ from: range.from, insert: prepend }],
        range: EditorSelection.range(
          range.from + prepend.length,
          range.to + prepend.length,
        ),
      }
    }),
  )
  view.focus()
}
export const toolbars: ICommand[] = [
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Quote,
  AlignCenter,
  AlignRight,
  Code,
  CodeBlock,
  ListUnordered,
  ListOrdered,
  Link,
  Multimedia,
  ResizeImage,
  Mention,
  Formula,
  Emoji,
  Cloud,
  Focus,
  Help,
]

export const toolbarShortcuts = toolbars
  .map((t) => t.shortcut)
  .filter(<T,>(v: T): v is NonNullable<T> => !!v)

export { wrapExecute } from "./helper"
export type { IWrapExecute } from "./helper"
