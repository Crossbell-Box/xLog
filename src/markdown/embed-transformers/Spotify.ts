import type { Transformer } from "../rehype-embed"
import { generateIframeHTML, includesSomeOfArray } from "./utils"

const getSpotifyIFrameSrc = (url: URL) => {
  const { pathname } = url
  const urlString = url.toString()
  const type = pathname.split("/")[1].toLowerCase()

  const podcastTypes = ["episode", "show"]
  if (podcastTypes.includes(type)) {
    return urlString.replace(type, `embed-podcast/${type}`)
  }

  return urlString.replace(type, `embed/${type}`)
}

export const SpotifyTransformer: Transformer = {
  name: "Spotify",
  shouldTransform(url) {
    const { host, pathname } = url

    return (
      host === "open.spotify.com" &&
      !includesSomeOfArray(pathname, ["embed", "embed-podcast"]) &&
      includesSomeOfArray(pathname, [
        "/album/",
        "/artist/",
        "/episode/",
        "/show/",
        "/track/",
        "/playlist/",
      ])
    )
  },
  getHTML(url) {
    const iframe = getSpotifyIFrameSrc(url)
    return generateIframeHTML({
      name: "spotify",
      src: iframe,
      height: "152px",
      width: "100%",
      style: "border-radius: 12px;",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
    })
  },
}
