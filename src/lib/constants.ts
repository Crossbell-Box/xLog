export const IS_BROWSER = typeof document !== "undefined"

export const IS_PROD = IS_BROWSER
  ? !location.hostname.endsWith("localhost")
  : process.env.NODE_ENV === "production"
export const IS_DEV = process.env.NODE_ENV === "development"

export const IS_VERCEL_PREVIEW =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
  process.env.VERCEL_ENV === "preview"

export const MAXIMUM_FILE_SIZE = 100 // MB
