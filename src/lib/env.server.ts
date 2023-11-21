import getConfig from "next/config"

const config = getConfig() || {}

export const REDIS_URL = config.ENV_REDIS_URL || process.env.REDIS_URL
export const REDIS_EXPIRE =
  parseInt(config.ENV_REDIS_EXPIRE || process.env.REDIS_EXPIRE || "0") ||
  60 * 60 * 24 * 7 // 1 week
export const REDIS_REFRESH =
  parseInt(config.ENV_REDIS_REFRESH || process.env.REDIS_REFRESH || "0") ||
  5 * 1000 // 5 seconds

export const SIMPLEHASH_API_KEY =
  config.ENV_SIMPLEHASH_API_KEY || process.env.SIMPLEHASH_API_KEY
export const OPENAI_API_KEY =
  config.ENV_OPENAI_API_KEY || process.env.OPENAI_API_KEY
export const ANONYMOUS_ACCOUNT_PRIVATEKEY =
  config.ENV_ANONYMOUS_ACCOUNT_PRIVATEKEY ||
  process.env.ANONYMOUS_ACCOUNT_PRIVATEKEY
export const PORTFOLIO_GITHUB_TOKEN =
  config.ENV_PORTFOLIO_GITHUB_TOKEN || process.env.PORTFOLIO_GITHUB_TOKEN
