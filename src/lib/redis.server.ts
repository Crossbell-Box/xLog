import Redis from "ioredis"
import { REDIS_URL, REDIS_EXPIRE, REDIS_REFRESH } from "~/lib/env.server"

let redis: Redis
if (REDIS_URL) {
  redis = new Redis(REDIS_URL)

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

export async function cacheGet(
  key: string | (Record<string, any> | string | undefined)[],
  getValueFun: () => Promise<any>,
  noUpdate?: boolean,
) {
  if (redis && redis.status === "ready") {
    let redisKey: string
    if (Array.isArray(key)) {
      redisKey = key
        .map((k) => (typeof k === "string" ? k : JSON.stringify(k)))
        .join(":")
    } else {
      redisKey = key
    }
    const cacheValue = await redis.get(redisKey)
    if (cacheValue) {
      if (!noUpdate) {
        setTimeout(() => {
          getValueFun().then((value) => {
            redis.set(redisKey, JSON.stringify(value), "EX", REDIS_EXPIRE)
          })
        }, Math.random() * REDIS_REFRESH)
      }
      return JSON.parse(cacheValue)
    } else {
      const value = await getValueFun()
      redis.set(redisKey, JSON.stringify(value), "EX", REDIS_EXPIRE)
      return value
    }
  } else {
    console.log("redis not ready")
    return await getValueFun()
  }
}

export function cacheDelete(
  key: string | (Record<string, any> | string | undefined)[],
) {
  if (redis && redis.status === "ready") {
    let redisKey: string
    if (Array.isArray(key)) {
      redisKey = key
        .map((k) => (typeof k === "string" ? k : JSON.stringify(k)))
        .join(":")
    } else {
      redisKey = key
    }
    redis.del(redisKey)
  }
}
