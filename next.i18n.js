"use strict"

const { localeConfig } = require("./next.json")

const availableLocales = localeConfig.filter((locale) => locale.enabled)

const defaultLocale = availableLocales.find((locale) => locale.default)

const getCurrentLocale = (route = "/", query = {}) => {
  const localeCode = route.split("/")[1] || query.locale || defaultLocale.code

  return availableLocales.find((c) => c.code === localeCode) || defaultLocale
}

/**
 * Configuration object for i18n.
 * @type {import('./src/lib/i18n/types').Config}
 */
const i18nConfig = {
  locales: availableLocales.map((locale) => locale.code),
  // Next.js will detect the browser language automatically
  // https://nextjs.org/docs/pages/building-your-application/routing/internationalization#automatic-locale-detection
  defaultLocale: "en",
  prefixDefault: false,
  basePath: "/",
}

exports.i18nConfig = i18nConfig
exports.availableLocales = availableLocales
exports.defaultLocale = defaultLocale
exports.getCurrentLocale = getCurrentLocale
