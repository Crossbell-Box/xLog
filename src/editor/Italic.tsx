import { ICommand, wrapExecute } from "."

export const Italic: ICommand = {
  name: "italic",
  label: "Italic",
  icon: "icon-[mingcute--italic-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "_", append: "_" })
  },
}
