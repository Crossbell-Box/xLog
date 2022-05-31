import { EditorSelection } from "@codemirror/state"
import { ICommand, wrapExecute } from "."

export const Bold: ICommand = {
  name: "bold",
  label: "Bold",
  icon: "i-bi:type-bold",
  execute: (view) => {
    wrapExecute({ view, prepend: "**", append: "**" })
  },
}
