import Redis from "ioredis"

import { REDIS_EXPIRE, REDIS_REFRESH, REDIS_URL } from "~/lib/env.server"

if (!REDIS_URL) {
  console.error("REDIS_URL not set")
}

let redisPromise: Promise<Redis | null> = new Promise((resolve, reject) => {
  if (REDIS_URL) {
    let redis = new Redis(REDIS_URL)

    redis.on("ready", () => {
      console.log("Redis connected.")
      resolve(redis)
    })

    redis.on("error", (error: any) => {
      console.error("Redis error: ", error)
      reject(error)
    })

    redis.on("end", () => {
      console.error("Redis end.")
      reject()
    })
  } else {
    resolve(null)
  }
})

export const getRedis = () => redisPromise

export async function cacheGet(options: {
  key: string | (Record<string, any> | string | undefined | number)[]
  getValueFun: () => Promise<any>
  noUpdate?: boolean
  noExpire?: boolean
  expireTime?: number
  allowEmpty?: boolean
}) {
  const redis = await redisPromise
  if (redis && redis.status === "ready") {
    let redisKey: string
    if (Array.isArray(options.key)) {
      redisKey = options.key
        .map((k) => (typeof k === "string" ? k : JSON.stringify(k)))
        .join(":")
    } else {
      redisKey = options.key
    }
    let cacheValue
    try {
      cacheValue = await redis.get(redisKey)
    } catch (error) {
      console.error("Redis get error: ", error)
    }
    if (cacheValue && cacheValue !== "undefined" && cacheValue !== "null") {
      if (!options.noUpdate) {
        setTimeout(() => {
          options.getValueFun().then((value) => {
            if (value) {
              redis.set(
                redisKey,
                JSON.stringify(value),
                "EX",
                options.expireTime || REDIS_EXPIRE,
              )
            }
          })
        }, Math.random() * REDIS_REFRESH)
      }
      try {
        return JSON.parse(cacheValue)
      } catch (error) {
        return cacheValue
      }
    } else {
      console.debug("cache miss", redisKey)
      if (options.allowEmpty) {
        options.getValueFun().then((value) => {
          if (value) {
            if (options.noExpire) {
              redis.set(redisKey, JSON.stringify(value))
            } else {
              redis.set(
                redisKey,
                JSON.stringify(value),
                "EX",
                options.expireTime || REDIS_EXPIRE,
              )
            }
          }
        })
        return null
      } else {
        const value = await options.getValueFun()
        if (value) {
          if (options.noExpire) {
            redis.set(redisKey, JSON.stringify(value))
          } else {
            redis.set(
              redisKey,
              JSON.stringify(value),
              "EX",
              options.expireTime || REDIS_EXPIRE,
            )
          }
        }
        return value
      }
    }
  } else {
    console.error("redis not ready")
    if (options.allowEmpty) {
      return null
    } else {
      return await options.getValueFun()
    }
  }
}

export async function cacheDelete(
  key: string | (Record<string, any> | string | undefined)[],
) {
  const redis = await redisPromise
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
  } else {
    console.error("redis not ready")
  }
}
