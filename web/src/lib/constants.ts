export const IS_BROWSER = typeof document !== "undefined"

export const IS_PROD = IS_BROWSER
  ? !location.hostname.endsWith("localhost")
  : process.env.NODE_ENV === "production"
