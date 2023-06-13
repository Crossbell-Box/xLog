import { type EditorView } from "@codemirror/view"

import { type ICommand, wrapExecute } from "."

const action = (view: EditorView) => {
  wrapExecute({ view, prepend: "_", append: "_" })
}

export const Italic: ICommand = {
  name: "italic",
  label: "Italic",
  icon: "icon-[mingcute--italic-line]",
  execute({ view }) {
    action(view)
  },
  shortcut: {
    key: "Mod-i",
    run(view) {
      action(view)
      return true
    },
  },
}
