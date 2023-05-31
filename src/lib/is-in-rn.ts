import { headers } from "next/headers"
import { userAgent } from "next/server"

export function isInRN() {
  const ua = userAgent({ headers: headers() }).ua

  if (!ua)
    return {
      inRN: false,
    }

  const match = ua.match(/ReactNative\/(\d+\.\d+\.\d+)/)

  if (!match)
    return {
      inRN: false,
    }

  return {
    inRN: true,
    version: match[1],
  }
}
