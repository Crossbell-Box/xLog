import { ICommand } from "."

export const Preview: ICommand = {
  name: "preview",
  label: "Toggle Preview",
  icon: "i-bi:eye",
  execute: (_, options) => {
    options?.setPreviewVisible?.((visible) => !visible)
  },
}
