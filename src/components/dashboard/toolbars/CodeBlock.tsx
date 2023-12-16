import { ICommand, wrapExecute } from "."

export const CodeBlock: ICommand = {
  name: "codeblock",
  label: "Code Block",
  icon: "i-mingcute-web-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "```\n", append: "\n```" })
  },
}
