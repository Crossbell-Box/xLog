export const R2_API_TOKEN = process.env.R2_API_TOKEN
export const MAILGUN_APIKEY = process.env.MAILGUN_APIKEY
export const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN
export const ENCRYPT_SECRET = process.env.ENCRYPT_SECRET

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME
export const PRIMARY_REGION = process.env.PRIMARY_REGION
export const FLY_REGION = process.env.FLY_REGION || "local"
export const IS_PRIMARY_REGION = FLY_REGION === PRIMARY_REGION
