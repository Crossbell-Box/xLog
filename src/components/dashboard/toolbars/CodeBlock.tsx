import { ICommand, wrapExecute } from "."

export const CodeBlock: ICommand = {
  name: "codeblock",
  label: "Code Block",
  icon: "icon-[mingcute--web-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "```\n", append: "\n```" })
  },
}
