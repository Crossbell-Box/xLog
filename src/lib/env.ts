import { IS_PROD } from "./constants"

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
export const OUR_DOMAIN = process.env.NEXT_PUBLIC_OUR_DOMAIN
export const SITE_URL = `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}`
export const R2_URL = process.env.NEXT_PUBLIC_R2_URL
export const APP_DESCRIPTION = process.env.APP_DESCRIPTION
export const DISCORD_LINK = process.env.NEXT_PUBLIC_DISCORD_LINK
export const GITHUB_LINK = process.env.NEXT_PUBLIC_GITHUB_LINK
