import { PrismaClient, type Prisma } from "@prisma/client"
import { IS_PROD } from "./constants"
import { isPrimaryRegion } from "./env"
import { singleton } from "./singleton.server"

const logLevel: Prisma.LogLevel[] = IS_PROD
  ? ["info", "error", "warn"]
  : ["info", "warn", "error", "query"]

export const prismaWrite = /* @__PURE__ */ singleton(
  "prisma-write",
  () =>
    new PrismaClient({
      log: logLevel,
    })
)

// Connect to the read replica of our database on Fly
export const prismaRead = /* @__PURE__ */ singleton("prisma-read", () => {
  // 5433 is the read-replica port
  let url = process.env.DATABASE_URL
  if (!isPrimaryRegion() && IS_PROD) {
    url = url.replace(":5432", ":5433")
  }
  console.log("read replica url", url.replace(/\w+@/, "PASSWORD@"))
  const client = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: logLevel,
  })

  client.$use(async (params, next) => {
    const now = performance.now()
    const result = await next(params)
    const end = performance.now()
    const duration = Math.floor(end - now)
    console.log("query took", duration, "ms")
    // See results here
    return result
  })

  return client
})
