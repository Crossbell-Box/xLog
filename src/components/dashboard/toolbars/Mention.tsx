import { ICommand, wrapExecute } from "."

export const Mention: ICommand = {
  name: "mention",
  label: "Mention",
  icon: "icon-[mingcute--at-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "@", append: "" })
  },
}
