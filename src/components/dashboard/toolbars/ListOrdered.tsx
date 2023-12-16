import { ICommand, wrapExecute } from "."

export const ListOrdered: ICommand = {
  name: "list-ordered",
  label: "Ordered List",
  icon: "i-mingcute-list-ordered-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "1. ", append: "\n" })
  },
}
