import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"

import { useIsDark } from "~/hooks/useDarkMode"

export const EmojiPicker = ({
  onEmojiSelect,
}: {
  onEmojiSelect: (e: any) => void
}) => {
  const ref = useRef<any>()
  const isDark = useIsDark()

  useEffect(() => {
    import("emoji-mart").then(async (EmojiMart) => {
      const response = await fetch(
        "https://fastly.jsdelivr.net/npm/@emoji-mart/data",
      )
      const data = await response.json()
      new EmojiMart.Picker({
        onEmojiSelect,
        data,
        ref,
        theme: isDark ? "dark" : "light",
      })
    })
  }, [])

  const t = useTranslations()

  return (
    <div
      ref={ref}
      className="min-w-[352px] min-h-[170px] bg-white border-border border rounded-[10px] flex justify-center items-center"
    >
      <span>{t("Loading")}</span>
    </div>
  )
}
