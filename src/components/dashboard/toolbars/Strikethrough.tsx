import { ICommand, wrapExecute } from "."

export const Strikethrough: ICommand = {
  name: "strikethrough",
  label: "Strikethrough",
  icon: "i-mingcute-strikethrough-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "~~", append: "~~" })
  },
}
