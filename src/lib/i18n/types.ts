import { Languages } from "./settings"

export interface Config {
  locales: Languages[]
  defaultLocale: string
  localeCookie?: string
  basePath?: string
}
