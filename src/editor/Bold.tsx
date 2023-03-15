import { EditorSelection } from "@codemirror/state"
import { ICommand, wrapExecute } from "."

export const Bold: ICommand = {
  name: "bold",
  label: "Bold",
  icon: "i-mingcute:bold-line",
  execute: (view) => {
    wrapExecute({ view, prepend: "**", append: "**" })
  },
}
