import { ICommand, wrapExecute } from "."

export const ListUnordered: ICommand = {
  name: "list-unordered",
  label: "Unordered List",
  icon: "icon-[mingcute--list-check-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "- ", append: "\n" })
  },
}
