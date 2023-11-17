import { cookies, headers } from "next/headers"

import { fallbackLng, Languages } from "~/lib/i18n/settings"

export function getAcceptLang() {
  let lng = fallbackLng

  const preferLang = cookies().get("preferred_language")?.value
  let acceptLang = headers().get("accept-language")?.split(",")[0]

  if (acceptLang === "zh-HK" || acceptLang === "zh-TW") {
    acceptLang = "zh-TW"
  } else {
    acceptLang = acceptLang?.split("-")[0]
  }

  if (acceptLang) {
    lng = acceptLang
  }
  if (preferLang) {
    lng = preferLang
  }

  return lng as Languages
}
