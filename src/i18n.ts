import { getRequestConfig } from "next-intl/server"

export const locales = ["en", "ja", "zh", "zh-TW"]
export const defaultLocale = "en"

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: "America/Los_Angeles",
}))
