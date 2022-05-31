import { ICommand, wrapExecute } from "."

export const Italic: ICommand = {
  name: "italic",
  label: "Italic",
  icon: "i-bi:type-italic",
  execute: (view) => {
    wrapExecute({ view, prepend: "_", append: "_" })
  },
}
