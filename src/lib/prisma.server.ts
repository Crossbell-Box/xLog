import { PrismaClient } from "@prisma/client"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set")
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
