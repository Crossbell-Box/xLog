import { type EditorView } from "@codemirror/view"

import { wrapExecute, type ICommand } from "."

const action = (view: EditorView) => {
  wrapExecute({ view, prepend: "**", append: "**" })
}

export const Bold: ICommand = {
  name: "bold",
  label: "Bold",
  icon: "i-mingcute-bold-line",
  execute({ view }) {
    action(view)
  },
  shortcut: {
    key: "Mod-b",
    run(view) {
      action(view)
      return true
    },
  },
}
