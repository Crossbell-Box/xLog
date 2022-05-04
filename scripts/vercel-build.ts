import * as esbuild from "esbuild"
import dotenv from "dotenv"
import fs from "fs-extra"

async function main() {
  const { parsed = {} } = dotenv.config()
  const envKeys = Object.keys(parsed)

  // Copy static file
  await fs.copy("public", ".vercel/output/static")

  // Edge function
  await esbuild.build({
    entryPoints: ["./app/middleware.ts"],
    format: "esm",
    platform: "node",
    bundle: true,
    outfile: ".vercel/output/functions/edge.func/index.js",
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  })

  fs.outputJSONSync(".vercel/output/functions/edge.func/.vc-config.json", {
    runtime: "edge",
    entrypoint: "index.js",
    envVarsInUse: envKeys,
  })

  // Serverless function
  await esbuild.build({
    entryPoints: ["./build/index.js"],
    format: "cjs",
    platform: "node",
    bundle: true,
    outfile: ".vercel/output/functions/render.func/index.js",
    plugins: [
      {
        name: "externalize-node-modules",
        setup(build) {
          build.onResolve({ filter: /.*/ }, async (args) => {
            if (args.pluginData?.skip) return
            const resolved = await build.resolve(args.path, {
              pluginData: {
                ...args.pluginData,
                skip: true,
              },
              importer: args.importer,
              namespace: args.namespace,
              resolveDir: args.resolveDir,
              kind: args.kind,
            })
            if (resolved.path.includes("node_modules")) {
              return {
                external: true,
              }
            }
            return resolved
          })
        },
      },
    ],
  })

  fs.outputJSONSync(".vercel/output/functions/render.func/.vc-config.json", {
    runtime: "nodejs14.x",
    handler: "index.js",
    launcherType: "Nodejs",
  })

  // Routes
  fs.outputJSONSync(".vercel/output/config.json", {
    version: 3,
    routes: [
      {
        src: `/build/.+`,
        headers: {
          "cache-control": "public, immutable, max-age=31536000",
        },
      },
      {
        handle: "filesystem",
      },
      {
        src: "/.*",
        middlewarePath: "edge",
        continue: true,
      },
      { src: "/.*", dest: "/render" },
    ].filter(Boolean),
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
