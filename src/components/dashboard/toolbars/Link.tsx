import { type EditorView } from "@codemirror/view"

import { wrapExecute, type ICommand } from "."

const action = (view: EditorView) => {
  wrapExecute({ view, prepend: "[", append: "]()" })
}

export const Link: ICommand = {
  name: "link",
  label: "Link",
  icon: "i-mingcute-link-2-line",
  execute({ view }) {
    action(view)
  },
  shortcut: {
    key: "Mod-k",
    run(view) {
      action(view)
      return true
    },
  },
}
