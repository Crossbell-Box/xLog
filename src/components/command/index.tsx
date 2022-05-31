import { EditorSelection } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { Dispatch, SetStateAction } from "react"
import { Bold } from "./Bold"
import { Code } from "./Code"
import { Heading } from "./Heading"
import { Image } from "./Image"
import { Italic } from "./Italic"
import { Link } from "./Link"
import { ListOrdered } from "./ListOrdered"
import { ListUnordered } from "./ListUnordered"
import { Preview } from "./Preview"
import { Quote } from "./Quote"
import { Strikethrough } from "./Strikethrough"

export type ICommand = {
  icon: React.ReactElement
  name: string
  execute: (
    view: EditorView,
    options?: {
      setPreviewVisible?: Dispatch<SetStateAction<boolean>>
      container?: HTMLElement | null
    },
  ) => void
}

export type IPrependExecute = {
  view: EditorView
  prepend: string
}

export type IWrapExecute = {
  view: EditorView
  prepend: string
  append: string
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

export const wrapExecute = ({ view, prepend, append }: IWrapExecute) => {
  const range = view.state.selection.ranges[0]
  const selection = view.state.sliceDoc(
    range.from - prepend.length,
    range.to + append.length,
  )
  if (selection.startsWith(prepend) && selection.endsWith(append)) {
    view.dispatch(
      view.state.changeByRange((range) => ({
        changes: [
          {
            from: range.from - prepend.length,
            to: range.to + append.length,
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
    view.state.changeByRange((range) => ({
      changes: [
        { from: range.from, insert: prepend },
        { from: range.to, insert: append },
      ],
      range: EditorSelection.range(
        range.from + prepend.length,
        range.to + prepend.length,
      ),
    })),
  )
  view.focus()
}

export const toolbars: ICommand[] = [
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  Code,
  ListUnordered,
  ListOrdered,
  Link,
  Image,
]

export const modeToolbars: ICommand[] = [Preview]
