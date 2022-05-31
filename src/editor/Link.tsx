import { EditorSelection } from "@codemirror/state"
import { ICommand, prependExecute, wrapExecute } from "."

export const Link: ICommand = {
  name: "link",
  label: "Link",
  icon: "i-bi:link",
  execute: (view) => {
    wrapExecute({ view, prepend: "[", append: "]()" })
  },
}
