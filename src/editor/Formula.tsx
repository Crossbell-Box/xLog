import { ICommand, wrapExecute } from "."

export const Formula: ICommand = {
  name: "formula",
  label: "Formula",
  icon: "icon-[mingcute--formula-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "$$ ", append: " $$" })
  },
}
