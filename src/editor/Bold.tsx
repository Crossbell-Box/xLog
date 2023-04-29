import { ICommand, wrapExecute } from "."

export const Bold: ICommand = {
  name: "bold",
  label: "Bold",
  icon: "icon-[mingcute--bold-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "**", append: "**" })
  },
}
