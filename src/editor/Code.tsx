import { ICommand, wrapExecute } from "."

export const Code: ICommand = {
  name: "code",
  label: "Inline Code",
  icon: "icon-[mingcute--code-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "`", append: "`" })
  },
}
