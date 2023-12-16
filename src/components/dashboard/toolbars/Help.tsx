import { getSiteLink } from "~/lib/helpers"

import { ICommand } from "."

export const Help: ICommand = {
  name: "help",
  label: "Help: Markdown syntax and components used by xLog",
  icon: "i-mingcute-question-line",
  execute: ({ view }) => {
    window.open(
      `${getSiteLink({
        subdomain: "xlog",
      })}/xfm`,
    )
  },
}
