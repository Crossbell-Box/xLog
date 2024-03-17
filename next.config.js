// @ts-check
const pkg = require("./package.json")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const execSync = require("child_process").execSync

const withNextIntl = require("next-intl/plugin")()

const lastCommitCommand = "git rev-parse HEAD"

module.exports = withBundleAnalyzer(
  withNextIntl({
    output: "standalone",
    env: {
      APP_DESCRIPTION: pkg.description,
    },
    experimental: {
      scrollRestoration: true,
      serverComponentsExternalPackages: ["rehype-react"],
      instrumentationHook: true,
    },
    productionBrowserSourceMaps: true,

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
      ENV_SIMPLEHASH_API_KEY: process.env.SIMPLEHASH_API_KEY,
      ENV_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ENV_ANONYMOUS_ACCOUNT_PRIVATEKEY:
        process.env.ANONYMOUS_ACCOUNT_PRIVATEKEY,
      ENV_PORTFOLIO_GITHUB_TOKEN: process.env.PORTFOLIO_GITHUB_TOKEN,
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

    async redirects() {
      return [
        {
          source: "/sitemap.txt",
          destination: "/sitemap.xml",
          permanent: true,
        },
        {
          source: "/sitemap.xml.gz",
          destination: "/sitemap.xml",
          permanent: true,
        },
        {
          source: "/sitemap_index.xml",
          destination: "/sitemap.xml",
          permanent: true,
        },
        {
          source: "/sitemaps.xml",
          destination: "/sitemap.xml",
          permanent: true,
        },
      ]
    },
  }),
)
