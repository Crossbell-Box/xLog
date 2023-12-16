import { ICommand, wrapExecute } from "."

export const AlignCenter: ICommand = {
  name: "align center",
  label: "Align Center",
  icon: "i-mingcute-align-center-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: ":p[", append: "]{.center}" })
  },
}
