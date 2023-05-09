import { NextServerResponse } from "~/lib/server-helper"

// /api/healthcheck
export async function GET() {
  const res = new NextServerResponse()
  return res.status(200).json({
    ok: true,
  })
}
