import { kv } from "@vercel/kv"

import { REDIS_EXPIRE, REDIS_REFRESH, REDIS_URL } from "~/lib/env.server"

if (!REDIS_URL) {
  console.warn("REDIS_URL not set")
}

export async function cacheGet(options: {
  key: string | (Record<string, any> | string | undefined | number)[]
  getValueFun: () => Promise<any>
  noUpdate?: boolean
  noExpire?: boolean
  expireTime?: number
  allowEmpty?: boolean
}) {
  let redisKey: string
  if (Array.isArray(options.key)) {
    redisKey = options.key
      .map((k) => (typeof k === "string" ? k : JSON.stringify(k)))
      .join(":")
  } else {
    redisKey = options.key
  }
  const cacheValue = await kv.get(redisKey)
  if (cacheValue && cacheValue !== "undefined" && cacheValue !== "null") {
    if (!options.noUpdate) {
      setTimeout(() => {
        options.getValueFun().then((value) => {
          if (value) {
            kv.set(redisKey, JSON.stringify(value), {
              ex: options.expireTime || REDIS_EXPIRE,
            })
          }
        })
      }, Math.random() * REDIS_REFRESH)
    }
    if (typeof cacheValue === "string") {
      return JSON.parse(cacheValue)
    } else {
      return cacheValue
    }
  } else {
    if (options.allowEmpty) {
      options.getValueFun().then((value) => {
        if (value) {
          if (options.noExpire) {
            kv.set(redisKey, JSON.stringify(value))
          } else {
            kv.set(redisKey, JSON.stringify(value), {
              ex: options.expireTime || REDIS_EXPIRE,
            })
          }
        }
      })
      return null
    } else {
      const value = await options.getValueFun()
      if (value) {
        if (options.noExpire) {
          kv.set(redisKey, JSON.stringify(value))
        } else {
          kv.set(redisKey, JSON.stringify(value), {
            ex: options.expireTime || REDIS_EXPIRE,
          })
        }
      }
      return value
    }
  }
}

export async function cacheDelete(
  key: string | (Record<string, any> | string | undefined)[],
) {
  let redisKey: string
  if (Array.isArray(key)) {
    redisKey = key
      .map((k) => (typeof k === "string" ? k : JSON.stringify(k)))
      .join(":")
  } else {
    redisKey = key
  }
  kv.del(redisKey)
}
