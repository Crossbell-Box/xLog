import type { Transformer } from "../rehype-embed"
import { iframeStyle, includesSomeOfArray } from "./utils"

const getIFrame = (url: URL) => {
  const { pathname, searchParams } = url
  const isSong = pathname.includes("/song")
  const id = searchParams.get("id")
  const type = isSong ? 2 : 0
  const height = isSong ? 66 : 430

  return {
    src: `//music.163.com/outchain/player?type=${type}&id=${id}&auto=0&height=${height}`,
    height: isSong ? 86 : 270,
  }
}

export const NetEaseMusicTransformer: Transformer = {
  name: "NetEaseMusic",
  shouldTransform(url) {
    const { host, pathname } = url

    return (
      host === "music.163.com" &&
      includesSomeOfArray(pathname, ["/song", "/playlist"])
    )
  },
  getHTML(url) {
    const iframe = getIFrame(url)

    return `<div class="xlog-post-content-netease" style="position: relative; width: 330px; height: ${iframe.height}px; margin: 1rem auto;">
      <iframe width="330" height="${iframe.height}" src="${iframe.src}" frameBorder="0" border="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen ${iframeStyle}></iframe>
    </div>`
  },
}
