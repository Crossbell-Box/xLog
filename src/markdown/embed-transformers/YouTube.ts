import type { Transformer } from "../rehype-embed"
import { generateIframeHTML, isHostIncludes } from "./utils"

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

const getYouTubeIFrameSrc = (url: URL) => {
  const id =
    url.host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v")

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${id}?rel=0`)

  url.searchParams.forEach((value, name) => {
    if (name === "v") {
      return
    }

    if (name === "t") {
      embedUrl.searchParams.append("start", getTimeValueInSeconds(value))
    } else {
      embedUrl.searchParams.append(name, value)
    }
  })

  return embedUrl.toString()
}

export const YouTubeTransformer: Transformer = {
  name: "Youtube",
  shouldTransform(url) {
    const { host, pathname, searchParams } = url

    return (
      host === "youtu.be" ||
      (isHostIncludes("youtube.com", host) &&
        pathname.includes("/watch") &&
        Boolean(searchParams.get("v")))
    )
  },
  getHTML(url) {
    return generateIframeHTML({
      name: "youtube",
      src: getYouTubeIFrameSrc(url),
      ratio: "16 / 9",
      allow:
        "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
      allowFullScreen: true,
    })
  },
}
