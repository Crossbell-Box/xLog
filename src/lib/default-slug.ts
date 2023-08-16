import { pinyin } from "pinyin-pro"

export const getDefaultSlug = (title: string, id?: string) => {
  let generated =
    pinyin(String(title), {
      toneType: "none",
      type: "array",
      nonZh: "consecutive",
    })
      ?.map((word) => word.trim())
      ?.filter((word) => word)
      ?.join("-")
      ?.replace(/\s+/g, "-") ||
    id?.replace(`!local-`, "")?.replace(`local-`, "") ||
    ""
  generated = generated.replace(/[^a-zA-Z0-9\s-_]/g, "")

  return generated
}
