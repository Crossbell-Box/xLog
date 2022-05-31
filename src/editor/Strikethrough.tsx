import { ICommand, wrapExecute } from "."

export const Strikethrough: ICommand = {
  name: "strikethrough",
  label: "Strikethrough",
  icon: "i-bi:type-strikethrough",
  execute: (view) => {
    wrapExecute({ view, prepend: "~~", append: "~~" })
  },
}
