import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useIsDark } from "~/hooks/useDarkMode"

export const EmojiPicker: React.FC<{
  onEmojiSelect: (e: any) => void
}> = ({ onEmojiSelect }) => {
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

  const { t } = useTranslation("common")

  return (
    <div
      ref={ref}
      className="min-w-[352px] min-h-[170px] bg-white border-border border rounded-[10px] flex justify-center items-center"
    >
      <span>{t("Loading")}</span>
    </div>
  )
}
