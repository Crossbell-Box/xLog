import { type RequestHandler } from "express"
import { IS_PROD } from "~/lib/constants"
import { getServerEnv, isPrimaryRegion } from "~/lib/env"

const PRIMARY_REGION = getServerEnv("PRIMARY_REGION")
const FLY_REGION = getServerEnv("FLY_REGION")

export const setFlyRegionHeader: RequestHandler = (req, res, next) => {
  res.setHeader("x-fly-region", FLY_REGION || "unknown")
  next()
}

export const getReplayResponse: RequestHandler = (req, res, next) => {
  const { method, path: pathname } = req

  if (
    !IS_PROD ||
    ["GET", "OPTIONS", "HEAD"].includes(method) ||
    isPrimaryRegion()
  ) {
    return next()
  }

  const logInfo = {
    pathname,
    method,
    PRIMARY_REGION,
    FLY_REGION,
  }
  console.info(`Replaying:`, logInfo)
  res.set("fly-replay", `region=${PRIMARY_REGION}`)
  return res.sendStatus(409)
}
