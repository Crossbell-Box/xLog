import type { Transformer } from "../rehype-embed"
import { generateIframeHTML } from "./utils"

const getTimeValueInSeconds = (timeValue: string) => {
  if (Number(timeValue).toString() === timeValue) {
    return timeValue
  }

  const {
    2: hours = "0",
    4: minutes = "0",
    6: seconds = "0",
  } = timeValue.match(/((\d*)h)?((\d*)m)?((\d*)s)?/)!

  return String((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds))
}

const getBilibiliIFrameSrc = (url: URL) => {
  const match = url.pathname.match(/\/video\/([A-Za-z0-9]+)\/?/)
  if (!match || match.length < 1) return
  const bvid = match[1]

  const page = url.searchParams.get("p")
  const pageParam = page ? `&page=${page}` : ""

  const embedUrl = new URL(
    `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=false` +
      pageParam,
  )

  return embedUrl.toString()
}

export const BilibiliTransformer: Transformer = {
  name: "Bilibili",
  shouldTransform(url) {
    const { host, pathname } = url

    return host === "www.bilibili.com" && pathname.includes("/video/BV")
  },
  getHTML(url) {
    return generateIframeHTML({
      name: "bilibili",
      src: getBilibiliIFrameSrc(url),
      ratio: "16 / 9",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
      allowFullScreen: true,
    })
  },
}
