import type { Transformer } from "../rehype-embed"
import { includesSomeOfArray } from "./utils"

export const MetingAudioTransformer: Transformer = {
  name: "MetingAudio",
  shouldTransform(url) {
    const { host, pathname } = url

    return (
      (host === "music.163.com" &&
        includesSomeOfArray(pathname, [
          "/song",
          "/artist",
          "/playlist",
          "/album",
          "/discover/toplist",
        ])) ||
      (host === "y.qq.com" &&
        includesSomeOfArray(pathname, [
          "/song",
          "/album",
          "/singer",
          "/playsquare",
          "/playlist",
        ]))
    )
  },
  getHTML(url) {
    return `<meting-audio url=${url.toString()} />`
  },
}
