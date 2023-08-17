export const fallbackLng = "en"
export const languages = ["en", "zh", "zh-TW", "ja"]
export const languageNames = {
  en: "English",
  zh: "中文",
  "zh-TW": "中文（繁體）",
  ja: "日本語",
  auto: "Auto",
}
export const defaultNS = "common"

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}
