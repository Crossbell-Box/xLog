import getConfig from "next/config"

const config = getConfig() || {}

export const REDIS_URL = config.ENV_REDIS_URL || process.env.REDIS_URL
export const REDIS_EXPIRE =
  parseInt(config.ENV_REDIS_EXPIRE || process.env.REDIS_EXPIRE || "0") ||
  60 * 60 * 24 * 7 // 1 week
export const REDIS_REFRESH =
  parseInt(config.ENV_REDIS_REFRESH || process.env.REDIS_REFRESH || "0") ||
  5 * 1000 // 5 seconds

export const MORALIS_WEB3_API_KEY =
  config.ENV_MORALIS_WEB3_API_KEY || process.env.MORALIS_WEB3_API_KEY
export const ALCHEMY_ETHEREUM_API_KEY =
  config.ENV_ALCHEMY_ETHEREUM_API_KEY || process.env.ALCHEMY_ETHEREUM_API_KEY
export const ALCHEMY_POLYGON_API_KEY =
  config.ENV_ALCHEMY_POLYGON_API_KEY || process.env.ALCHEMY_POLYGON_API_KEY
export const NFTSCAN_API_KEY =
  config.ENV_NFTSCAN_API_KEY || process.env.NFTSCAN_API_KEY
export const OPENSEA_API_KEY =
  config.ENV_OPENSEA_API_KEY || process.env.OPENSEA_API_KEY
export const POAP_API_KEY = config.ENV_POAP_API_KEY || process.env.POAP_API_KEY
export const OPENAI_API_KEY =
  config.ENV_OPENAI_API_KEY || process.env.OPENAI_API_KEY
