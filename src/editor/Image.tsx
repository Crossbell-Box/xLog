import { EditorSelection } from "@codemirror/state"
import { ICommand, prependExecute, wrapExecute } from "."

export const Image: ICommand = {
  name: "image",
  label: "Image",
  icon: "i-bi:image",
  execute: (view) => {
    wrapExecute({ view, prepend: "![", append: "]()" })
  },
}
