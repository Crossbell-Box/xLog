import { Config } from "./types"

export function validateConfig(config: Config): void {
  if (!Array.isArray(config.locales)) {
    throw new Error(`The config requires a 'locales' array.`)
  }

  if (!config.defaultLocale) {
    throw new Error(`The config requires a 'defaultLocale'.`)
  }

  if (!config.locales.includes(config.defaultLocale)) {
    throw new Error(`The 'defaultLocale' must be contained in 'locales' array.`)
  }

  if (config.localeDetector && typeof config.localeDetector !== "function") {
    throw new Error(`'localeDetector' must be a function.`)
  }
}
