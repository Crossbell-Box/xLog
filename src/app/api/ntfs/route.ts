import { Asset } from "unidata.js"

import { IPFS_GATEWAY } from "~/lib/env"
import { cacheGet, getRedis } from "~/lib/redis.server"
import { NextServerResponse, getQuery } from "~/lib/server-helper"
import { getNFTs } from "~/models/site.model"

export async function GET(req: Request): Promise<Response> {
  const query = getQuery(req)
  const res = new NextServerResponse()
  if (!query.address) {
    return res.status(400).end()
  }

  const redis = await getRedis()
  const redisKey = `nfts/${query.address}`

  let cache
  try {
    cache = await redis?.get(redisKey)
  } catch (error) {}
  if (cache) {
    return res.status(200).json(JSON.parse(cache))
  } else {
    const result = await getNFTs(query.address as string)
    await Promise.all(
      result.list.map(async (nft: Asset) => {
        if (!nft.items?.[0].mime_type && nft.items?.[0]?.address) {
          try {
            new URL(nft.items[0].address)
          } catch (error) {
            return nft
          }
          try {
            const mime_type = await cacheGet({
              key: `nft-mimetype/${nft.items[0].address}`,
              getValueFun: async () => {
                const head = await fetch(
                  `${nft.items![0].address!.replace(
                    IPFS_GATEWAY,
                    "https://gateway.ipfs.io/ipfs/",
                  )}`,
                  {
                    method: "HEAD",
                  },
                )
                return head.headers.get("content-type")
              },
            })
            nft.items[0].mime_type = mime_type
          } catch (error) {
            console.warn(error)
          }
        }
        return nft
      }),
    )
    redis?.set(redisKey, JSON.stringify(result), "EX", 60 * 60 * 24)
    return res.status(200).json({
      list: [],
    })
  }
}
