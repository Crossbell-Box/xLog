import { getPlaiceholder } from "plaiceholder"

import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"

const getImage = async (src: string) => {
  return cacheGet({
    key: ["getImage", src],
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      const buffer = await fetch(src).then(async (res) =>
        Buffer.from(await res.arrayBuffer()),
      )

      let height: number | null = null
      let width: number | null = null
      let plaiceholder: {
        base64: string
      } | null = null
      try {
        const {
          metadata: { height: h, width: w },
          ...plaice
        } = await getPlaiceholder(buffer, { size: 10 })
        height = h
        width = w
        plaiceholder = plaice
      } catch (error) {}

      return {
        base64: plaiceholder?.base64,
        size: { height, width },
      }
    },
  })
}

export async function GET(req: Request) {
  let { url } = getQuery(req)
  if (!url) {
    return new NextServerResponse()
      .status(400)
      .json({ error: "url is required" })
  }
  const res = new NextServerResponse()
  return res.status(200).json(await getImage(url))
}
