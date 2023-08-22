import { Tweet, getTweet } from "react-tweet/api"

import { cacheGet } from "~/lib/redis.server"
import { NextServerResponse, getQuery } from "~/lib/server-helper"

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
      expireTime: 60 * 60 * 24 * 3,
      getValueFun: async () => await getTweet(tweetId),
    })) as Tweet | undefined
    return res.status(tweet ? 200 : 404).json({ data: tweet ?? null })
  } catch (error: any) {
    console.error(error)
    return res.status(400).json({ error: error?.message ?? "Bad request." })
  }
}
