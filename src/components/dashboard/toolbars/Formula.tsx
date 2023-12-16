import { ICommand, wrapExecute } from "."

export const Formula: ICommand = {
  name: "formula",
  label: "Formula",
  icon: "i-mingcute-formula-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "$$ ", append: " $$" })
  },
}
