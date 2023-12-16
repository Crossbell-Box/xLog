import { EmojiPicker } from "~/components/common/EmojiPicker"

import { ICommand, wrapExecute } from "."

export const Emoji: ICommand<string> = {
  name: "emoji",
  label: "Emoji",
  icon: "i-mingcute-emoji-2-line",
  execute: ({ view, payload }) => {
    wrapExecute({ view, prepend: payload || "", append: "" })
  },
  ui: ({ transferPayload }) => (
    <EmojiPicker onEmojiSelect={(e: any) => transferPayload(e.native)} />
  ),
}
