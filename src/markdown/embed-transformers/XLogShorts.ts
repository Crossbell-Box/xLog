import { match } from "path-to-regexp"

import type { Transformer } from "../rehype-embed"

function getParamsFromShortsURL(url: URL) {
  let slug = ""
  let handle = ""

  // https://caspian-3030.xlog.app/AtOAglnMV_N6xslDbfhz4?ct=shorts
  let matched = match<{ slug: string }>("/:slug")(url.pathname)

  if (matched) {
    slug = matched.params.slug
    handle = url.host.split(".")[0]
  } else {
    // https://xlog.app/site/caspian-3030/AtOAglnMV_N6xslDbfhz4?ct=shorts
    matched = match<{ slug: string; handle: string }>("/site/:handle/:slug")(
      url.pathname,
    )

    if (!matched) return undefined

    slug = matched?.params.slug || ""
    // @ts-ignore
    handle = matched?.params.handle || ""
  }

  return { slug, handle }
}

export const XLogShortsTransformer: Transformer = {
  name: "XLogShorts",
  shouldTransform(url) {
    return !!getParamsFromShortsURL(url)
  },
  getHTML(url) {
    const { slug, handle } = getParamsFromShortsURL(url)!

    return `<xlog-shorts slug="${slug}" handle="${handle}" url="${url.toString()}"/>`
  },
}
