import { IPFS_GATEWAY_FALLBACK, SITE_URL } from "~/lib/env"
import { parsePost } from "~/lib/json-feed"
import { NextServerResponse } from "~/lib/server-helper"
import { ExpandedNote } from "~/lib/types"
import { getFeed } from "~/queries/home.server"

export async function GET(request: Request) {
  const feed = await getFeed({
    type: "latest",
    useHTML: true,
    limit: 10,
  })

  const data = {
    version: "https://jsonfeed.org/version/1",
    title: "xLog Latest",
    icon: `${IPFS_GATEWAY_FALLBACK}bafkreigxdnr5lvtjxqin5upquomrti2s77hlgtjy5zaeu43uhpny75rbga`,
    home_page_url: `${SITE_URL}/`,
    feed_url: `${SITE_URL}/feed/latest`,
    items: feed?.list?.map((post: ExpandedNote) => parsePost(post)),
  }

  const format =
    new URLSearchParams(request.url.split("?")[1]).get("format") === "json"
      ? "json"
      : "xml"

  const res = new NextServerResponse()
  return res.status(200).rss(data, format)
}

export const dynamic = "force-dynamic"
