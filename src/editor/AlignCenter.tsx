import { ICommand, wrapExecute } from "."

export const AlignCenter: ICommand = {
  name: "align center",
  label: "Align Center",
  icon: "icon-[mingcute--align-center-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: ":p[", append: "]{.center}" })
  },
}
