import { PrismaClient } from "@prisma/client"
import { singleton } from "./singleton.server"

export const prisma = /* @__PURE__ */ singleton(
  "prisma",
  () => new PrismaClient()
)
