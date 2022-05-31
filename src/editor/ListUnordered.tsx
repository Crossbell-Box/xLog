import { ICommand, wrapExecute } from "."

export const ListUnordered: ICommand = {
  name: "list-unordered",
  label: "Unordered List",
  icon: "i-bi:list-ul",
  execute: (view) => {
    wrapExecute({ view, prepend: "- ", append: "\n" })
  },
}
