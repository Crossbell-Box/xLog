import { EditorSelection } from "@codemirror/state"
import { EditorView } from "@codemirror/view"

export type IWrapExecute = {
  view: EditorView
  prepend: string
  append: string
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
