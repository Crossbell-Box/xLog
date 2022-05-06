import { PrismaClient } from "@prisma/client"
import { IS_PROD } from "./constants"
import { isPrimaryRegion } from "./env"
import { singleton } from "./singleton.server"

export const prismaWrite = /* @__PURE__ */ singleton(
  "prisma-write",
  () => new PrismaClient()
)

// Connect to the read replica of our database on Fly
export const prismaRead = /* @__PURE__ */ singleton("prisma-read", () => {
  // 5433 is the read-replica port
  let url = process.env.DATABASE_URL
  if (!isPrimaryRegion() && IS_PROD) {
    url = url.replace(":5432", ":5433")
  }
  console.log("read replica url", url)
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  })
})
