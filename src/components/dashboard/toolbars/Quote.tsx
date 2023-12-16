import { ICommand, wrapExecute } from "."

export const Quote: ICommand = {
  name: "quote",
  label: "Quote",
  icon: "i-mingcute-quote-left-fill",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "> ", append: "\n" })
  },
}
