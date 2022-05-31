import { ICommand, wrapExecute } from "."

export const Quote: ICommand = {
  name: "quote",
  label: "Quote",
  icon: "i-bi:quote",
  execute: (view) => {
    wrapExecute({ view, prepend: "> ", append: "\n" })
  },
}
