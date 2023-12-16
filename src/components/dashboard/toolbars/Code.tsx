import { ICommand, wrapExecute } from "."

export const Code: ICommand = {
  name: "code",
  label: "Inline Code",
  icon: "i-mingcute-code-line",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "`", append: "`" })
  },
}
