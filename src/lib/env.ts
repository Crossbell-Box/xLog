import { IS_PROD } from "./constants"

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "xLog"
export const APP_SLOGAN =
  process.env.NEXT_PUBLIC_APP_SLOGAN || "Write. Own. Earn."
export const OUR_DOMAIN =
  process.env.NEXT_PUBLIC_OUR_DOMAIN ||
  process.env.NEXT_PUBLIC_VERCEL_URL ||
  "localhost:2222"
export const SCORE_API_DOMAIN = process.env.NEXT_PUBLIC_SCORE_API_DOMAIN
export const DOCS_DOMAIN = `docs.${OUR_DOMAIN}`
export const SITE_URL = `${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}`
export const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION ||
  "An open-source creative community written on the blockchain."
export const DISCORD_LINK = process.env.NEXT_PUBLIC_DISCORD_LINK
export const GITHUB_LINK = process.env.NEXT_PUBLIC_GITHUB_LINK
export const TWITTER_LINK = process.env.NEXT_PUBLIC_TWITTER_LINK
export const CSB_IO = process.env.NEXT_PUBLIC_CSB_IO || "https://crossbell.io"
export const CSB_XFEED =
  process.env.NEXT_PUBLIC_CSB_XFEED || "https://xfeed.app"
export const CSB_SCAN =
  process.env.NEXT_PUBLIC_CSB_SCAN || "https://scan.crossbell.io"
export const CSB_XCHAR =
  process.env.NEXT_PUBLIC_CSB_XCHAR || "https://xchar.app"
export const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.4everland.xyz/ipfs/"
export const IPFS_GATEWAY_FALLBACK =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_FALLBACK ||
  "https://gateway.ipfs.io/ipfs/"
export const MIRA_LINK =
  process.env.NEXT_PUBLIC_MIRA_LINK || "https://mira.crossbell.io"
export const WALLET_CONNECT_V2_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID
export const DEFAULT_AVATAR =
  "ipfs://bafkreiabgixxp63pg64moxnsydz7hewmpdkxxi3kdsa4oqv4pb6qvwnmxa"
export const UMAMI_ID =
  process.env.NEXT_PUBLIC_UMAMI_ID || "c2a15ccb-dba8-4763-b4a7-0e0edf5a8857"
export const UMAMI_SCRIPT =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT || "https://umami.rss3.io/umami"
