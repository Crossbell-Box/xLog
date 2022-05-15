import { PrismaClient, type Prisma } from "@prisma/client"
import { IS_BROWSER, IS_PROD } from "./constants"
import { singleton } from "./singleton.server"

const logLevel: Prisma.LogLevel[] = IS_PROD
  ? ["info", "error", "warn"]
  : ["info", "warn", "error", "query"]

const createPrisma = (readonly: boolean) => {
  if (!IS_PROD && !IS_BROWSER) {
    for (const k in require.cache) {
      if (k.includes("prisma")) {
        delete require.cache[k]
      }
    }
  }

  let url = process.env.DATABASE_URL

  if (readonly && process.env.RO_DATABASE_URL) {
    url = process.env.RO_DATABASE_URL
  }

  const client = new PrismaClient({
    log: logLevel,
    datasources: {
      db: {
        url,
      },
    },
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
}

export const prismaPrimary = /* @__PURE__ */ singleton("prisma-primary", () =>
  createPrisma(false)
)

export const prismaRead = /* @__PURE__ */ singleton("prisma-read", () =>
  createPrisma(true)
)

export type { Prisma }
