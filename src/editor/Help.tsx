import { getSiteLink } from "~/lib/helpers"
import { ICommand } from "."

export const Help: ICommand = {
  name: "help",
  label: "Help: xLog Flavored Markdown",
  icon: "i-mingcute:question-line",
  execute: ({ view }) => {
    window.open(
      `${getSiteLink({
        subdomain: "xlog",
      })}/xfm`,
    )
  },
}
