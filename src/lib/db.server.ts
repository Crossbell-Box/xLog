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

  // DATABASE_URL is not set during production build in docker
  // But Prisma is actually used there, so just return a fake one
  // It's weird that @__PURE__ doesn't work for Next.js
  if (!url) return {} as PrismaClient

  if (url && readonly && IS_PROD) {
    url = url.replace(":5432", ":5433")
  }

  console.log("connecting to", url)

  const client = new PrismaClient({
    log: logLevel,
    datasources: url
      ? {
          db: {
            url,
          },
        }
      : undefined,
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

export * from "@prisma/client"
