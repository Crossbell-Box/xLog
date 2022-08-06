import {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client"
import Redis from "ioredis"

let redis: Redis
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL)

  redis.on("error", (error: any) => {
    console.error("Redis error: ", error)
  })
  redis.on("end", () => {
    console.log("Redis end")
  })
  redis.on("connect", () => {
    console.log("Redis connected.")
  })
}

export function createRedisPersister(redisValidKey = "reactQuery") {
  if (process.env.REDIS_URL) {
    return {
      persistClient: async (client: PersistedClient) => {
        redis.set(redisValidKey, JSON.stringify(client))
      },
      restoreClient: async () => {
        const data = await redis.get(redisValidKey)
        if (data) {
          return JSON.parse(data)
        } else {
          return undefined
        }
      },
      removeClient: async () => {
        await redis.del(redisValidKey)
      },
    } as Persister
  } else {
    return null
  }
}
