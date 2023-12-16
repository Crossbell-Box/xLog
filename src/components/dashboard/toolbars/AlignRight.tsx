import { ICommand, wrapExecute } from "."

export const AlignRight: ICommand = {
  name: "align right",
  label: "Align Right",
  icon: "i-mingcute-align-right-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: ":p[", append: "]{.right}" })
  },
}
