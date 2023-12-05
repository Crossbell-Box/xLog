import { getRequestConfig } from "next-intl/server"

export const locales = ["en", "ja", "zh", "zh-TW"] as const
export const languageNames: Record<(typeof locales)[number], string> = {
  en: "English",
  ja: "Japanese",
  zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
}
export const defaultLocale = "en"

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: "America/Los_Angeles",
}))
