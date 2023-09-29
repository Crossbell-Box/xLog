import { ICommand } from "."

export const Focus: ICommand = {
  name: "focus",
  label: "Toggle Focus Mode",
  icon: "icon-[mingcute--fullscreen-line]",
  execute: ({ router }) => {
    router?.updateSearchParams(
      "focus",
      router.searchParams.get("focus") === "true" ? "false" : "true",
    )
  },
}
