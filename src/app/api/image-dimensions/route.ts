import AsyncLock from "async-lock"
import sizeOf from "image-size"

import { Metadata } from "@prisma/client"

import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"

const lock = new AsyncLock()

const getImageDimensionByUri = async (
  uri: string,
  useFullSize = false,
): Promise<{ width: number; height: number; uri: string } | null> => {
  const headers: Record<string, string> = {}

  if (!useFullSize) {
    headers["Range"] = "bytes=0-10240"
  }

  try {
    const response = await fetch(uri, { headers })
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const dimensions = sizeOf(buffer)
    if (dimensions.width && dimensions.height) {
      return {
        width: dimensions.width,
        height: dimensions.height,
        uri,
      }
    } else {
      throw new Error("Could not determine image dimensions.")
    }
  } catch (e) {
    if (!useFullSize) {
      return getImageDimensionByUri(uri, true)
    }

    return null
  }
}

const getCoverDimensions = async ({
  cid,
  uris,
}: {
  cid: string
  uris: string[]
}) => {
  if (!uris.length) return

  const dimensions = (await cacheGet({
    key: ["coverDimensions", cid],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      let result

      await lock.acquire(`coverDimensions_${cid}`, async () => {
        const meta = await prisma.metadata.findFirst({
          where: {
            uri: `ipfs://${cid}`,
          },
        })

        const key: keyof Metadata = "image_dimensions"
        const dimensions = meta?.image_dimensions

        if (dimensions) {
          result = dimensions
        } else {
          const newDimensions: Record<
            string,
            { width: number; height: number }
          > = {}

          console.time(`get image dimensions ${cid}`)
          for (const uri of uris) {
            const dimension = await getImageDimensionByUri(
              toGateway(uri),
            ).catch(() => null)
            if (dimension) {
              newDimensions[uri] = dimension
            }
          }
          console.timeEnd(`get image dimensions ${cid}`)

          if (meta) {
            await prisma.metadata.update({
              where: { uri: `ipfs://${cid}` },
              data: {
                [key]: newDimensions,
              },
            })
          } else {
            await prisma.metadata.create({
              data: {
                uri: `ipfs://${cid}`,
                [key]: newDimensions,
              },
            })
          }
          result = newDimensions
        }
      })

      return result
    },
  })) as Record<string, { width: number; height: number }> | undefined

  return dimensions
}

export async function GET(req: Request): Promise<Response> {
  let { cid, uris: _uris } = getQuery(req)
  const uris = _uris.split(",")
  const res = new NextServerResponse()

  if (!cid) {
    return res.status(400).send("Bad Request")
  }

  if (uris.length === 0) return res.status(200).json({})

  return res.status(200).json({
    data: await getCoverDimensions({ cid, uris }),
  })
}
