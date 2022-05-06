import { type RequestHandler } from "express"
import {
  FLY_REGION,
  IS_PRIMARY_REGION,
  PRIMARY_REGION,
} from "~/lib/config.server"
import { IS_PROD } from "~/lib/config.shared"

export const setFlyRegionHeader: RequestHandler = (req, res, next) => {
  res.setHeader("x-fly-region", FLY_REGION || "unknown")
  next()
}

export const getReplayResponse: RequestHandler = (req, res, next) => {
  const { method, path: pathname } = req

  if (
    !IS_PROD ||
    ["GET", "OPTIONS", "HEAD"].includes(method) ||
    IS_PRIMARY_REGION
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
