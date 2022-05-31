import { ICommand, prependExecute } from "."

export const Heading: ICommand = {
  name: "heading",
  label: "Heading",
  icon: "i-bi:type-h3",
  execute: (view) => {
    prependExecute({ view, prepend: "### " })
  },
}
