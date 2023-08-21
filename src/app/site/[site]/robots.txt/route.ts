import { NextRequest } from "next/server"

import { NextServerResponse } from "~/lib/server-helper"

export const GET = async (req: NextRequest) => {
  const response = new NextServerResponse()

  return response.headers({
    "Content-Type": "text/plain",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Origin": "*",
  }).text(`User-Agent: *
Allow: /
Disallow: /dashboard/
Disallow: /preview/
Disallow: /api/

Sitemap: https://${req.headers.get("host")}/sitemap.xml`)
}
