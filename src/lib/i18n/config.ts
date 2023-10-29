import { i18nConfig as _i18nConfig } from "../../../next.i18n"
import { defaultLocaleDetector } from "./default-locale-detector"
import { Config } from "./types"

export const i18nConfig: Config = {
  locales: _i18nConfig.locales,
  defaultLocale: _i18nConfig.defaultLocale,
  localeCookie: _i18nConfig.localeCookie || "NEXT_LOCALE",
  localeDetector: _i18nConfig.localeDetector || defaultLocaleDetector,
  prefixDefault: _i18nConfig.prefixDefault || false,
  basePath: _i18nConfig.basePath || "",
}
