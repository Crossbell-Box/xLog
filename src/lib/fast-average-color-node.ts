// This file is a fork of https://github.com/fast-average-color/fast-average-color-node/blob/main/src/index.ts
// The difference is that the dependency node-fetch was removed
import {
  FastAverageColor,
  FastAverageColorOptions,
  FastAverageColorResult,
} from "fast-average-color"
import sharp from "sharp"

const fac = new FastAverageColor()

const MIN_SIZE = 10
const MAX_SIZE = 100

function prepareSizeAndPosition(
  originalSize: { width: number; height: number },
  options: FastAverageColorOptions,
) {
  const srcLeft = options.left ?? 0
  const srcTop = options.top ?? 0
  const srcWidth = options.width ?? originalSize.width
  const srcHeight = options.height ?? originalSize.height

  let destWidth = srcWidth
  let destHeight = srcHeight

  if (options.mode === "precision") {
    return {
      srcLeft,
      srcTop,
      srcWidth,
      srcHeight,
      destWidth,
      destHeight,
    }
  }

  let factor

  if (srcWidth > srcHeight) {
    factor = srcWidth / srcHeight
    destWidth = MAX_SIZE
    destHeight = Math.round(destWidth / factor)
  } else {
    factor = srcHeight / srcWidth
    destHeight = MAX_SIZE
    destWidth = Math.round(destHeight / factor)
  }

  if (
    destWidth > srcWidth ||
    destHeight > srcHeight ||
    destWidth < MIN_SIZE ||
    destHeight < MIN_SIZE
  ) {
    destWidth = srcWidth
    destHeight = srcHeight
  }

  return {
    srcLeft,
    srcTop,
    srcWidth,
    srcHeight,
    destWidth,
    destHeight,
  }
}

export async function getAverageColor(
  resource: string | Buffer,
  options: FastAverageColorOptions = {},
): Promise<FastAverageColorResult> {
  let input = resource

  if (typeof resource === "string") {
    const base64 = resource.split(/^data:image\/.*?;base64,/)[1]

    if (base64) {
      input = Buffer.from(base64, "base64")
    } else if (resource.search(/^https?:\/\//) !== -1) {
      const response = await fetch(resource)
      const arrayBuffer = await response.arrayBuffer()
      input = Buffer.from(arrayBuffer)
    }
  }

  const left = options.left ?? 0
  const top = options.top ?? 0

  let pipe = await sharp(input)

  const metadata = await pipe.metadata()

  if (metadata.width && metadata.height) {
    const size = prepareSizeAndPosition(
      {
        width: metadata.width,
        height: metadata.height,
      },
      options,
    )

    pipe = pipe
      .extract({
        left,
        top,
        width: size.srcWidth,
        height: size.srcHeight,
      })
      .resize(size.destWidth, size.destHeight)
  }

  const buffer = await pipe.ensureAlpha().raw().toBuffer()
  const pixelArray = new Uint8Array(buffer.buffer)

  return fac.prepareResult(fac.getColorFromArray4(pixelArray, options))
}
