import { ColorScheme } from "./types"

export const IS_BROWSER = typeof document !== "undefined"

export const IS_PROD = IS_BROWSER
  ? !location.hostname.endsWith("localhost")
  : process.env.NODE_ENV === "production"
export const IS_DEV = process.env.NODE_ENV === "development"

export const IS_VERCEL_PREVIEW =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
  process.env.VERCEL_ENV === "preview"

export const MAXIMUM_FILE_SIZE = 100 // MB

export const COLOR_SCHEME_DARK = "dark"
export const COLOR_SCHEME_LIGHT = "light"
export const DEFAULT_COLOR_SCHEME: ColorScheme = "light"
export const DARK_MODE_STORAGE_KEY = "darkMode"

export const RESERVED_TAGS = ["page", "post", "portfolio", "comment", "short"]
