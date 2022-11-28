import { NextApiRequest, NextApiResponse } from "next"
import { getNFTs } from "~/models/site.model"
import { getRedis, cacheGet } from "~/lib/redis.server"
import { Asset } from "unidata.js"
import { IPFS_GATEWAY } from "~/lib/env"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query

  if (!query.address) {
    res.status(400).end()
    return
  }

  const redis = getRedis()
  const redisKey = `nfts/${query.address}`

  const cache = await redis.get(redisKey)
  if (cache) {
    res.status(200).json(JSON.parse(cache))
  } else {
    const result = await getNFTs(query.address as string)
    await Promise.all(
      result.list.map(async (nft: Asset) => {
        if (!nft.items?.[0].mime_type && nft.items?.[0]?.address) {
          try {
            const mime_type = await cacheGet(
              `nft-mimetype/${nft.items[0].address}`,
              async () => {
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
            )
            nft.items[0].mime_type = mime_type
          } catch (error) {
            console.warn(error)
          }
        }
        return nft
      }),
    )
    redis.set(redisKey, JSON.stringify(result), "EX", 60 * 60 * 24)
    res.status(200).json(result)
  }
}
