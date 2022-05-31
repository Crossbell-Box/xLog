import { ICommand, wrapExecute } from "."

export const ListUnordered: ICommand = {
  name: "list-unordered",
  icon: (
    <svg height="16" viewBox="0 0 16 16" width="16">
      <path d="M2 4a1 1 0 100-2 1 1 0 000 2zm3.75-1.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zM3 8a1 1 0 11-2 0 1 1 0 012 0zm-1 6a1 1 0 100-2 1 1 0 000 2z"></path>
    </svg>
  ),
  execute: (view) => {
    wrapExecute({ view, prepend: "- ", append: "\n" })
  },
}
