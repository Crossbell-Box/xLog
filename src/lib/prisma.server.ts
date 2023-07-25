import { PrismaClient } from "@prisma/client"

if (!process.env.POSTGRES_PRISMA_URL) {
  console.warn("POSTGRES_PRISMA_URL not set")
}

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
