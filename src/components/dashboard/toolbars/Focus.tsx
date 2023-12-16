import { ICommand } from "."

export const Focus: ICommand = {
  name: "focus",
  label: "Toggle Focus Mode",
  icon: "i-mingcute-fullscreen-line",
  execute: () => {
    let elem = document.getElementById("dashboard-main")
    if (!elem) {
      return
    }

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        )
      })
    } else {
      document.exitFullscreen()
    }
  },
}
