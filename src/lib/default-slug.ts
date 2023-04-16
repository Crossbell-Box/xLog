import pinyin from "pinyin"

export const getDefaultSlug = (title: string, id?: string) => {
  let generated =
    pinyin(title as string, {
      style: pinyin.STYLE_NORMAL,
      compact: true,
    })?.[0]
      ?.map((word) => word.trim())
      ?.filter((word) => word)
      ?.join("-")
      ?.replace(/\s+/g, "-") ||
    id?.replace(`local-`, "") ||
    ""
  generated = generated.replace(/[^a-zA-Z0-9\s-_]/g, "")

  return generated
}
