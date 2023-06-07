import { getPlaiceholder } from "plaiceholder"

import { cacheGet } from "~/lib/redis.server"
import { NextServerResponse, getQuery } from "~/lib/server-helper"

const getImage = async (src: string) => {
  return cacheGet({
    key: ["getImage", src],
    noUpdate: true,
    getValueFun: async () => {
      const buffer = await fetch(src).then(async (res) =>
        Buffer.from(await res.arrayBuffer()),
      )

      const {
        metadata: { height, width },
        ...plaiceholder
      } = await getPlaiceholder(buffer, { size: 10 })

      return {
        base64: plaiceholder.base64,
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
