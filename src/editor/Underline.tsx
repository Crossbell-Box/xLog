import { ICommand, wrapExecute } from "."

export const Underline: ICommand = {
  name: "underline",
  label: "Underline",
  icon: "i-bi:type-underline",
  execute: (view) => {
    wrapExecute({ view, prepend: "<u>", append: "</u>" })
  },
}
