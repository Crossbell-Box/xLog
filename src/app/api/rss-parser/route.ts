import Parser from "rss-parser"

import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"

const parser = new Parser()

export async function GET(req: Request): Promise<Response> {
  let { url } = getQuery(req)
  const res = new NextServerResponse()

  if (!url) {
    return res.status(400).json({ error: "Bad request." })
  }

  try {
    const parsed = (await cacheGet({
      key: `rss-parser/${url}`,
      expireTime: 60 * 60 * 1,
      getValueFun: async () => {
        let feed: Parser.Output<{
          [key: string]: any
        }> | null = null
        try {
          feed = await parser.parseURL(url)
        } catch (error) {}
        return feed
      },
    })) as Parser.Output<{
      [key: string]: any
    }> | null
    return res.status(parsed ? 200 : 404).json({ data: parsed ?? null })
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error?.message ?? "Bad request." })
  }
}
