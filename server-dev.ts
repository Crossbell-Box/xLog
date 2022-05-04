/**
 * The dev server serve the Remix app and use ./app/middleware.ts as a middleware (Vercel)
 * In production the middleware will be bundled to .vercel folder and Vercel will handle that
 */
import "dotenv/config"
import path from "path"
import express from "express"
import { createRequestHandler } from "@remix-run/vercel"
import { createRemixRequest, sendRemixResponse } from "@remix-run/vercel/server"
import { NEXT_HEADER, REWRITE_HEADER } from "~/middleware-utils"

const app = express()

const BUILD_DIR = path.resolve("build")

// Remix fingerprints its assets so we can cache forever.
app.use("/build", express.static("public/build"))

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public"))

app.use(async (req, res, next) => {
  const middleware = require("~/middleware").default

  const request = createRemixRequest(req as any)
  let response: Response = await middleware(request)

  if (response.headers.has(NEXT_HEADER)) {
    return next()
  }

  const rewriteTo = response.headers.get(REWRITE_HEADER)
  if (rewriteTo) {
    response = await fetch(rewriteTo)
    response.headers.delete("content-encoding")
  }

  sendRemixResponse(res as any, response as any)
})

app.all("*", (req, res) => {
  purgeRequireCache()
  const handler = createRequestHandler({
    build: require("@remix-run/dev/server-build"),
    mode: process.env.NODE_ENV,
  })
  // @ts-expect-error
  return handler(req, res)
})

const PORT = process.env.PORT || "3000"
app.listen(PORT)

console.log(`Open http://localhost:${PORT}`)

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (let key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key]
    }
  }
}
