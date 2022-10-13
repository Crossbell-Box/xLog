import { IS_PROD } from "./constants"

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "xLog"
export const OUR_DOMAIN = process.env.NEXT_PUBLIC_OUR_DOMAIN
export const DOCS_DOMAIN = `docs.${OUR_DOMAIN}`
export const SITE_URL = `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}`
export const R2_URL = process.env.NEXT_PUBLIC_R2_URL
export const APP_DESCRIPTION = process.env.APP_DESCRIPTION
export const DISCORD_LINK = process.env.NEXT_PUBLIC_DISCORD_LINK
export const GITHUB_LINK = process.env.NEXT_PUBLIC_GITHUB_LINK
export const TWITTER_LINK = process.env.NEXT_PUBLIC_TWITTER_LINK
export const CSB_IO = process.env.NEXT_PUBLIC_CSB_IO || "https://crossbell.io"
export const CSB_SCAN =
  process.env.NEXT_PUBLIC_CSB_SCAN || "https://scan.crossbell.io"
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.4everland.xyz/ipfs/"
