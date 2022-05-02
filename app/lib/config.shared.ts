export const IS_BROWSER = typeof window !== "undefined"

export const IS_PROD = IS_BROWSER
  ? !location.hostname.endsWith("localhost")
  : process.env.NODE_ENV === "production"

export const APP_NAME = IS_BROWSER ? ENV.APP_NAME : process.env.APP_NAME
export const OUR_DOMAIN = IS_BROWSER ? ENV.OUR_DOMAIN : process.env.OUR_DOMAIN
