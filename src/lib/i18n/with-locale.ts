import { i18nConfig } from "./config"

export const withLocale = (
  path: string,
  options: {
    prefixDefault?: boolean // Whether to prefix the default locale.
    pathLocale?: string // The locale from the path.
  },
) => {
  const { prefixDefault = false, pathLocale = i18nConfig.defaultLocale } =
    options

  if (i18nConfig.defaultLocale === pathLocale) {
    if (prefixDefault) {
      return `/${i18nConfig.defaultLocale}${path}`
    } else {
      return path
    }
  } else {
    return `/${pathLocale}${path}`
  }
}

export const withLocaleFactory =
  (options: Parameters<typeof withLocale>[1]) =>
  (path: string, _options: Parameters<typeof withLocale>[1] = {}) =>
    withLocale(path, { ...options, ..._options })
