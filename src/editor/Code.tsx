import { EditorSelection } from "@codemirror/state"
import { ICommand, wrapExecute } from "."

export const Code: ICommand = {
  name: "code",
  label: "Inline Code",
  icon: "i-bi:code",
  execute: (view) => {
    wrapExecute({ view, prepend: "`", append: "`" })
  },
}
