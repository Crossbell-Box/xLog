// @ts-check
const pkg = require("./package.json")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const execSync = require("child_process").execSync
const { withSentryConfig } = require("@sentry/nextjs")

const withPWA = require("@ducanh2912/next-pwa").default({
  disable: process.env.NODE_ENV === "development",
  dest: "public",
  publicExcludes: ["*"],
  buildExcludes: [/\.map$/, /^manifest.*\.js$/, /\/chunks\/app\/dashboard/],
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ url }) => {
          return /\/ipfs\/([^/?#]+)$/.test(url.toString())
        },
        handler: "CacheFirst",
        options: {
          cacheName: "next-ipfs",
          expiration: {
            maxEntries: 200,
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
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
    ],
  },
})

const lastCommitCommand = "git rev-parse HEAD"

module.exports = withSentryConfig(
  withBundleAnalyzer(
    // @ts-ignore
    withPWA({
      output: "standalone",
      env: {
        APP_DESCRIPTION: pkg.description,
      },
      experimental: {
        scrollRestoration: true,
        serverComponentsExternalPackages: ["rehype-react"],
      },
      productionBrowserSourceMaps: true,

      // https://github.com/vercel/next.js/issues/38436
      swcMinify: false,

      webpack(config) {
        config.resolve.fallback = { fs: false } // polyfill node-id3

        // https://github.com/WalletConnect/walletconnect-monorepo/blob/7716e164281c2f531145d682c3658f761fa0a823/providers/universal-provider/src/utils/deepLinks.ts#L39
        // @walletconnect/universal-provider imports react-native conditionally.
        // Since this is a NextJS app, simply mark it as external to avoid the webpack bundling warning.
        config.externals.push("react-native")

        // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908#issuecomment-1487801131
        config.externals.push("pino-pretty", "lokijs", "encoding")

        // https://github.com/WalletConnect/walletconnect-utils/blob/b7d7dc003c25dd33ef74c2fac483140f71a51d86/jsonrpc/http-connection/src/http.ts#L2
        // `@walletconnect/jsonrpc-http-connection` imports `cross-fetch` to support fetch in Node.js. It's unnecessary for Next.JS app.
        config.resolve.alias["cross-fetch"] = require.resolve(
          "next/dist/build/polyfills/fetch/index.js",
        )

        // https://github.com/kkomelin/isomorphic-dompurify/issues/54
        // Fix isomorphic-dompurify in app router
        config.externals = [...config.externals, "jsdom", "sharp"]

        return config
      },

      images: {
        dangerouslyAllowSVG: true,
        contentSecurityPolicy:
          "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
        remotePatterns: [
          { hostname: "**" },
          { protocol: "https", hostname: "pbs.twimg.com" },
          { protocol: "https", hostname: "abs.twimg.com" },
        ],
      },

      async generateBuildId() {
        return execSync(lastCommitCommand).toString().trim()
      },

      serverRuntimeConfig: {
        ENV_REDIS_URL: process.env.REDIS_URL,
        ENV_REDIS_EXPIRE: process.env.REDIS_EXPIRE,
        ENV_REDIS_REFRESH: process.env.REDIS_REFRESH,
        ENV_NFTSCAN_API_KEY: process.env.NFTSCAN_API_KEY,
        ENV_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ENV_ANONYMOUS_ACCOUNT_PRIVATEKEY:
          process.env.ANONYMOUS_ACCOUNT_PRIVATEKEY,
      },

      async headers() {
        return [
          {
            source: "/.well-known/apple-app-site-association",
            headers: [
              {
                key: "Content-Type",
                value: "application/json",
              },
            ],
          },
        ]
      },
      staticPageGenerationTimeout: 3600,
    }),
  ),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "xlog",
    project: "xlog-web",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
)
