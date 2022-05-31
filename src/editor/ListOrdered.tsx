import { EditorSelection } from "@codemirror/state"
import { ICommand, wrapExecute } from "."

export const ListOrdered: ICommand = {
  name: "list-ordered",
  label: "Ordered List",
  icon: "i-bi:list-ol",
  execute: (view) => {
    wrapExecute({ view, prepend: "1. ", append: "\n" })
  },
}
