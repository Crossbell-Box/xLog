import { ICommand, wrapExecute } from "."

export const Underline: ICommand = {
  name: "underline",
  label: "Underline",
  icon: "i-mingcute:underline-line",
  execute: (view) => {
    wrapExecute({ view, prepend: "<u>", append: "</u>" })
  },
}
