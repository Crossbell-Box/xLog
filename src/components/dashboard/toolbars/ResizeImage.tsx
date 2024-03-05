import { type EditorView } from "@codemirror/view"

import { ICommand, wrapExecute } from "."

const action = (view: EditorView) => {
  wrapExecute({
    view,
    prepend: ':::div{style="max=width: 300px"}\n',
    append: "\n:::",
  })
}

export const ResizeImage: ICommand = {
  name: "resize-image",
  label: "Resize Image",
  icon: "i-mingcute-aspect-ratio-line",
  execute: ({ view }) => {
    action(view)
  },
  shortcut: {
    key: "Mod-Shift-s",
    run(view) {
      action(view)
      return true
    },
  },
}
