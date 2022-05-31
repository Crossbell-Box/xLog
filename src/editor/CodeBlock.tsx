import { ICommand, wrapExecute } from "."

export const CodeBlock: ICommand = {
  name: "codeblock",
  label: "Code Block",
  icon: "i-bi:body-text",
  execute: (view) => {
    wrapExecute({ view, prepend: "```\n", append: "\n```" })
  },
}
