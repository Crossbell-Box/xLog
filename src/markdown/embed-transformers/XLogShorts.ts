import { match } from "path-to-regexp"

import type { Transformer } from "../rehype-embed"
import { isHostIncludes } from "./utils"

export const XLogShortsTransformer: Transformer = {
  name: "XLogShorts",
  shouldTransform(url) {
    // There are two patterns for xlog shorts url

    const { host, pathname, searchParams } = url
    const hasShortsParam = searchParams.get("ct") === "shorts"

    /**
     * content type param is required
     * @example ?ct=shorts
     * */
    if (!hasShortsParam) return false

    // https://xlog.app/site/caspian-3030/AtOAglnMV_N6xslDbfhz4?ct=shorts
    if (isHostIncludes("xlog.app", host) && pathname.startsWith("/site/")) {
      return true
    }

    // https://caspian-3030.xlog.app/AtOAglnMV_N6xslDbfhz4?ct=shorts
    return /^[a-z0-9-]+\.xlog\.app/.test(host)
  },
  getHTML(url) {
    let slug = ""
    let handle = ""

    // import { match } from "path-to-regexp"
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

      if (!matched) return

      slug = matched?.params.slug || ""
      // @ts-ignore
      handle = matched?.params.handle || ""
    }

    return `<xlog-shorts slug="${slug}" handle="${handle}"/>`
  },
}
