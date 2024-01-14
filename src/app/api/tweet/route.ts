import { getTweet, Tweet } from "react-tweet/api"

import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"

export async function GET(req: Request): Promise<Response> {
  let { id: tweetId } = getQuery(req)
  const res = new NextServerResponse()

  if (!tweetId) {
    return res.status(400).json({ error: "Bad request." })
  }

  try {
    const tweet = (await cacheGet({
      key: `tweet/${tweetId}`,
      noUpdate: true,
      noExpire: true,
      getValueFun: async () => await getTweet(tweetId),
    })) as Tweet | undefined
    return res.status(tweet ? 200 : 404).json({ data: tweet ?? null })
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error?.message ?? "Bad request." })
  }
}
