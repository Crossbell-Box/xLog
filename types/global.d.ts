import { PrismaClient } from "@prisma/client"

export {}

declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any,
    ): number
  }

  var prisma: PrismaClient | undefined
}
