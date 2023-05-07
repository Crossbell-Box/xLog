// @ts-check
const pkg = require("./package.json")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const execSync = require("child_process").execSync

const cache = require("next-pwa/cache")
const withPWA = require("next-pwa")({
  disable: process.env.NODE_ENV === "development",
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
})

const lastCommitCommand = "git rev-parse HEAD"

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer(
  // @ts-ignore
  withPWA({
    env: {
      APP_DESCRIPTION: pkg.description,
    },
    experimental: {
      scrollRestoration: true,
      appDir: true,
      serverComponentsExternalPackages: ["nodejieba", "rehype-react", "pinyin"],
    },
    output: "standalone",
    productionBrowserSourceMaps: true,

    webpack(config) {
      config.resolve.fallback = { fs: false } // polyfill node-id3
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
  }),
)
