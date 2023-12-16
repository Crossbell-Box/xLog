import { ICommand, prependExecute } from "."

export const Heading: ICommand = {
  name: "heading",
  label: "Heading",
  icon: "i-mingcute-heading-2-line",
  execute: ({ view }) => {
    prependExecute({ view, prepend: "## " })
  },
}
