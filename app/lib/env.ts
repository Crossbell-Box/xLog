import { IS_BROWSER } from "./constants"

/**
 * Can be called in browser and server
 * only exposing env variables that're available in browser
 */
export const getCommonEnv = <T extends keyof BrowserEnv>(
  key: T
): BrowserEnv[T] => {
  return IS_BROWSER ? ENV[key] : process.env[key]
}

export const getServerEnv = <T extends keyof ServerEnv>(
  key: T
): ServerEnv[T] => {
  if (IS_BROWSER) throw new Error(`getServerEnv() called in browser`)
  return process.env[key]
}

// Use /* @__PURE__ */ annotation to make tree-shaking work
export const AUTH_COOKIE_NAME = /* @__PURE__ */ getServerEnv("AUTH_COOKIE_NAME")
export const APP_NAME = /* @__PURE__ */ getCommonEnv("APP_NAME")
export const OUR_DOMAIN = /* @__PURE__ */ getCommonEnv("OUR_DOMAIN")
export const S3_CDN_PREFIX = /* @__PURE__ */ getCommonEnv("S3_CDN_PREFIX")
export const S3_REGION = /* @__PURE__ */ getServerEnv("S3_REGION")
export const S3_ACCESS_KEY_ID = /* @__PURE__ */ getServerEnv("S3_ACCESS_KEY_ID")
export const S3_SECRET_ACCESS_KEY = /* @__PURE__ */ getServerEnv(
  "S3_SECRET_ACCESS_KEY"
)
export const S3_BUCKET_NAME = /* @__PURE__ */ getServerEnv("S3_BUCKET_NAME")
export const S3_ENDPOINT = /* @__PURE__ */ getServerEnv("S3_ENDPOINT")
export const MAILGUN_APIKEY = /* @__PURE__ */ getServerEnv("MAILGUN_APIKEY")
export const MAILGUN_DOMAIN = /* @__PURE__ */ getServerEnv("MAILGUN_DOMAIN")
export const MAILGUN_EU = /* @__PURE__ */ getServerEnv("MAILGUN_EU")
export const PRIMARY_REGION = /* @__PURE__ */ getServerEnv("PRIMARY_REGION")
export const FLY_REGION = /* @__PURE__ */ getServerEnv("FLY_REGION")
export const IS_PRIMARY_REGION = !FLY_REGION || PRIMARY_REGION === FLY_REGION
