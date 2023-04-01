import { IS_PROD } from "./constants"

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "xLog"
export const OUR_DOMAIN = process.env.NEXT_PUBLIC_OUR_DOMAIN
export const SCORE_API_DOMAIN = process.env.NEXT_PUBLIC_SCORE_API_DOMAIN
export const DOCS_DOMAIN = `docs.${OUR_DOMAIN}`
export const SITE_URL = `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}`
export const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION ||
  "xLog, the best on-chain and open-source blogging community for everyone."
export const DISCORD_LINK = process.env.NEXT_PUBLIC_DISCORD_LINK
export const GITHUB_LINK = process.env.NEXT_PUBLIC_GITHUB_LINK
export const TWITTER_LINK = process.env.NEXT_PUBLIC_TWITTER_LINK
export const CSB_IO = process.env.NEXT_PUBLIC_CSB_IO || "https://crossbell.io"
export const CSB_SCAN =
  process.env.NEXT_PUBLIC_CSB_SCAN || "https://scan.crossbell.io"
export const CSB_XCHAR =
  process.env.NEXT_PUBLIC_CSB_XCHAR || "https://xchar.app"
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.4everland.xyz/ipfs/"
export const MIRA_LINK =
  process.env.NEXT_PUBLIC_MIRA_LINK || "https://mira.crossbell.io"
