import { NextServerResponse } from "~/lib/server-helper"

export async function GET() {
  const res = new NextServerResponse()
  return res.status(200).json({
    ok: true,
  })
}
