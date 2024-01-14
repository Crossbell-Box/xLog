import type { Transformer } from "../rehype-embed"
import { generateIframeHTML, includesSomeOfArray } from "./utils"

const parseLink = (url: string) => {
  const rules = [
    ["music.163.com.*playlist", "0"],
    ["music.163.com.*album", "1"],
    ["music.163.com.*song", "2"],
  ]
  for (let rule of rules) {
    let patt = new RegExp(rule[0])
    let res = patt.exec(url)
    if (res !== null) {
      return {
        type: rule[1],
      }
    }
  }
  return {}
}

const getIFrame = (url: URL) => {
  const { pathname, searchParams } = url
  const isSong = pathname.includes("/song")
  const id = searchParams.get("id")
  const { type } = parseLink(url.toString())

  const height = isSong ? 66 : 250

  return {
    src: `https://music.163.com/outchain/player?type=${type}&id=${id}&auto=0&height=${height}`,
    height: isSong ? 86 : 250,
  }
}

export const NetEaseMusicTransformer: Transformer = {
  name: "NetEaseMusic",
  shouldTransform(url) {
    const { host, pathname } = url

    return (
      host === "music.163.com" &&
      includesSomeOfArray(pathname, ["/song", "/playlist", "/album"])
    )
  },
  getHTML(url) {
    const iframe = getIFrame(url)
    return generateIframeHTML({
      name: "netease",
      src: iframe.src,
      height: iframe.height + "px",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
    })
  },
}
