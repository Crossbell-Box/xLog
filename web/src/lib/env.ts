import { IS_PROD } from "./constants"

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
export const OUR_DOMAIN = process.env.NEXT_PUBLIC_OUR_DOMAIN
export const S3_CDN_PREFIX = process.env.NEXT_PUBLIC_S3_CDN_PREFIX
export const SITE_URL = `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}`
