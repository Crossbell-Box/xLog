// @ts-check
import { execSync } from "child_process"
import pwa from "next-pwa"
import cache from "next-pwa/cache.js"
import fs from "node:fs"
import path from "node:path"

import withBundleAnalyzer from "@next/bundle-analyzer"
import { withSentryConfig } from "@sentry/nextjs"
import SentryWebpackPlugin from "@sentry/webpack-plugin"

const IS_DEV = process.env.NODE_ENV === "development"

// @ts-check
const pkg = JSON.parse(
  fs.readFileSync(
    path.resolve(new URL(import.meta.url).pathname, "../package.json"),
    "utf-8",
  ),
)

const lastCommitCommand = "git rev-parse HEAD"

/** @type {import('next').NextConfig} */
let nextConfig = {
  sentry: {
    hideSourceMaps: true,
  },
  env: {
    APP_DESCRIPTION: pkg.description,
  },
  experimental: {
    scrollRestoration: true,
  },
  output: "standalone",
  productionBrowserSourceMaps: true,

  webpack(config) {
    config.resolve.fallback = { fs: false } // polyfill node-id3
    // sentry start

    if (
      process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT
    ) {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: ".next",
          ignore: ["node_modules", "cypress", "test"],
          urlPrefix: "~/_next",
        }),
      )
    }
    // sentry end
    return config
  },

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
    remotePatterns: [{ hostname: "**" }],
  },

  async generateBuildId() {
    return execSync(lastCommitCommand).toString().trim()
  },

  serverRuntimeConfig: {
    ENV_REDIS_URL: process.env.REDIS_URL,
    ENV_REDIS_EXPIRE: process.env.REDIS_EXPIRE,
    ENV_REDIS_REFRESH: process.env.REDIS_REFRESH,
    ENV_MORALIS_WEB3_API_KEY: process.env.MORALIS_WEB3_API_KEY,
    ENV_ALCHEMY_ETHEREUM_API_KEY: process.env.ALCHEMY_ETHEREUM_API_KEY,
    ENV_ALCHEMY_POLYGON_API_KEY: process.env.ALCHEMY_POLYGON_API_KEY,
    ENV_NFTSCAN_API_KEY: process.env.NFTSCAN_API_KEY,
    ENV_OPENSEA_API_KEY: process.env.OPENSEA_API_KEY,
    ENV_POAP_API_KEY: process.env.POAP_API_KEY,
    ENV_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

if (process.env.ANALYZE === "true") {
  nextConfig = withBundleAnalyzer({
    enabled: true,
  })(nextConfig)
}

if (!IS_DEV) {
  nextConfig = pwa({
    dest: "public",
    publicExcludes: ["*"],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => {
          return request.headers.get("x-middleware-prefetch")
        },
        handler: "NetworkOnly",
      },
      {
        urlPattern: ({ url }) => {
          return /\/ipfs\/([^/?#]+)$/.test(url.toString())
        },
        handler: "CacheFirst",
        options: {
          cacheName: "next-ipfs",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // cspell:ignore Fipfs
        urlPattern: /\/_next\/image\?url=.+%2Fipfs%2F([^/?#]+)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-ipfs",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      // @ts-ignore
      ...cache,
    ],
  })(nextConfig)
}

if (process.env.SENTRY_AUTH_TOKEN) {
  // @ts-ignore
  nextConfig = withSentryConfig(nextConfig, {
    silent: true,
  })
} else {
  console.log(
    "SENTRY_AUTH_TOKEN not found, Sentry monitoring feature will be disabled.",
  )
  delete nextConfig.sentry
}

export default nextConfig
