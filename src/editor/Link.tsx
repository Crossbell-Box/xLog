import { ICommand, wrapExecute } from "."

export const Link: ICommand = {
  name: "link",
  label: "Link",
  icon: "icon-[mingcute--link-2-line]",
  execute: ({ view }) => {
    wrapExecute({ view, prepend: "[", append: "]()" })
  },
}
