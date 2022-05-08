import "./globals/index"
import path from "path"
import express from "express"
import compression from "compression"
import morgan from "morgan"
import { createRequestHandler } from "@remix-run/express"
import { getReplayResponse, setFlyRegionHeader } from "./fly"
import { IS_PROD } from "~/lib/constants"

const BUILD_DIR = path.join(process.cwd(), "build")

const app = express()

app.all("*", getReplayResponse)

app.use(setFlyRegionHeader)

if (IS_PROD) {
  app.use(compression())
}

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static(
    "public/build",
    IS_PROD ? { immutable: true, maxAge: "1y" } : {}
  )
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", IS_PROD ? { maxAge: "1h" } : {}))

app.use(morgan("tiny"))

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache()

        return createRequestHandler({
          build: require("@remix-run/dev/server-build"),
          mode: process.env.NODE_ENV,
        })(req, res, next)
      }
    : createRequestHandler({
        build: require("@remix-run/dev/server-build"),
        mode: process.env.NODE_ENV,
      })
)
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Open http://localhost:${port}`)
})

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
