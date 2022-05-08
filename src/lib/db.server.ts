import { PrismaClient, type Prisma } from "@prisma/client"
import { IS_PROD } from "./constants"
import { singleton } from "./singleton.server"

const logLevel: Prisma.LogLevel[] = IS_PROD
  ? ["info", "error", "warn"]
  : ["info", "warn", "error", "query"]

export const prisma = /* @__PURE__ */ singleton("prisma-read", () => {
  const client = new PrismaClient({
    log: logLevel,
  })

  client.$use(async (params, next) => {
    const now = Date.now()
    const result = await next(params)
    const end = Date.now()
    const duration = Math.floor(end - now)
    console.log("query took", duration, "ms")
    // See results here
    return result
  })

  return client
})
