import { type RequestHandler } from "express"
import { FLY_REGION } from "~/lib/env"

export const setFlyRegionHeader: RequestHandler = (req, res, next) => {
  res.setHeader("x-fly-region", FLY_REGION || "unknown")
  next()
}
