import { i18nConfig } from "./config"
import { Languages } from "./settings"

export const withLocale = (
  path: string,
  options: {
    defaultLocale?: Languages // The default locale.
    prefixDefault?: boolean // Whether to prefix the default locale.
    pathLocale?: Languages // The locale from the path.
  },
) => {
  const {
    prefixDefault = false,
    pathLocale,
    defaultLocale = i18nConfig.defaultLocale,
  } = options
  // { pathLocale: undefined, defaultLocale: 'en', prefixDefault: true }

  console.log("======options", path, options)

  if (pathLocale === defaultLocale) {
    if (prefixDefault) {
      return `/${pathLocale}${path}`
    } else {
      return path
    }
  } else {
    return `/${pathLocale || defaultLocale}${path}`
  }
}

export const withLocaleFactory =
  (options: Parameters<typeof withLocale>[1]) =>
  (path: string, _options: Parameters<typeof withLocale>[1] = {}) =>
    withLocale(path, { ...options, ..._options })
