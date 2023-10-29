import { NextRequest } from "next/server"

export interface Config {
  locales: string[]
  defaultLocale: string
  localeCookie?: string
  localeDetector?: ((request: NextRequest, config: Config) => string) | false
  prefixDefault?: boolean
  basePath?: string
}
