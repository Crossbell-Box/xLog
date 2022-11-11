import { useEffect, useRef } from "react"

export const EmojiPicker: React.FC<{
  onEmojiSelect: (e: any) => void
}> = ({ onEmojiSelect }) => {
  const ref = useRef<any>()

  useEffect(() => {
    import("emoji-mart").then(async (EmojiMart) => {
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/@emoji-mart/data",
      )
      const data = await response.json()
      new EmojiMart.Picker({
        onEmojiSelect,
        data,
        ref,
      })
    })
  }, [])

  return <div ref={ref}></div>
}
