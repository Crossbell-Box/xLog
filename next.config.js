// @ts-check
const pkg = require("./package.json")
const spawn = require("cross-spawn")

class UnoCSS {
  /**
   *
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.beforeRun.tapPromise("unocss", async () => {
      spawn.sync("pnpm", ["uno-generate"], { stdio: "inherit" })
    })
    let watching = false
    compiler.hooks.watchRun.tap("unocss", () => {
      if (watching) return
      watching = true
      spawn("pnpm", ["uno-generate", "--watch"], { stdio: "inherit" })
    })
  }
}

/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    APP_DESCRIPTION: pkg.description,
  },
  experimental: {
    scrollRestoration: true,
    outputStandalone: true,
  },

  webpack(config) {
    config.plugins.push(new UnoCSS())
    return config
  },
}
