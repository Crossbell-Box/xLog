import { ICommand, wrapExecute } from "."

export const Quote: ICommand = {
  name: "quote",
  icon: (
    <svg height="16" viewBox="0 0 16 16" width="16">
      <path d="M1.75 2.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H1.75zm4 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zM2.5 7.75a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z"></path>
    </svg>
  ),
  execute: (view) => {
    wrapExecute({ view, prepend: "> ", append: "\n" })
  },
}
