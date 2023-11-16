import { availableLocales } from "../../../next.i18n"

export const fallbackLng = "en"
export const languages = (availableLocales as Array<any>).map(
  (locale) => locale.code,
) as ["en", "zh", "zh-TW", "ja"]
export type Languages = (typeof languages)[number]
export const languageNames: Record<Languages | "auto", string> = {
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
