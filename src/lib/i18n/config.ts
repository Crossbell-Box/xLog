import { i18nConfig as _i18nConfig } from "../../../next.i18n"
import { Config } from "./types"

export const i18nConfig: Config = {
  locales: _i18nConfig.locales,
  defaultLocale: _i18nConfig.defaultLocale,
  localeCookie: _i18nConfig.localeCookie || "NEXT_LOCALE",
  basePath: _i18nConfig.basePath || "",
}
