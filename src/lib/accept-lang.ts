import { headers } from "next/headers"

import { fallbackLng } from "~/lib/i18n/settings"

export function getAcceptLang() {
  let lng = fallbackLng

  let acceptLang = headers().get("accept-language")?.split(",")[0]
  if (acceptLang === "zh-HK" || acceptLang === "zh-TW") {
    acceptLang = "zh-TW"
  } else {
    acceptLang = acceptLang?.split("-")[0]
  }
  if (acceptLang) {
    lng = acceptLang
  }

  return lng
}
