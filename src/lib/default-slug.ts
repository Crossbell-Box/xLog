import { pinyin } from "pinyin-pro"

export const getDefaultSlug = (titleArray: string[], id?: string) => {
  const title = titleArray[0]

  const pinyinArray = pinyin(title, {
    toneType: "none",
    type: "array",
    nonZh: "consecutive",
  })

  const generated =
    pinyinArray
      ?.map((word) => word[0].trim())
      ?.filter((word) => word)
      ?.join("-")
      ?.replace(/\s+/g, "-") ||
    id?.replace(`!local-`, "")?.replace(`local-`, "") ||
    ""

  const cleanedGenerated = generated.replace(/[^a-zA-Z0-9\s-_]/g, "")

  if (cleanedGenerated && cleanedGenerated.split("-").length === 1) {
    return cleanedGenerated + "-"
  }

  return cleanedGenerated
}
