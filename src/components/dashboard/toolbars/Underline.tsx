import { type EditorView } from "@codemirror/view"

import { wrapExecute, type ICommand } from "."

const action = (view: EditorView) => {
  wrapExecute({ view, prepend: "<u>", append: "</u>" })
}

export const Underline: ICommand = {
  name: "underline",
  label: "Underline",
  icon: "i-mingcute-underline-line",
  execute: ({ view }) => {
    action(view)
  },
  shortcut: {
    key: "Mod-u",
    run(view) {
      action(view)
      return true
    },
  },
}
