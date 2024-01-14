import { match } from "path-to-regexp"

import type { Transformer } from "../rehype-embed"
import { isHostIncludes } from "./utils"

export const TweetTransformer: Transformer = {
  name: "Tweet",
  shouldTransform(url) {
    const { host, pathname } = url

    return (
      (isHostIncludes("twitter.com", host) || isHostIncludes("x.com", host)) &&
      pathname.includes("/status/")
    )
  },
  getHTML(url) {
    const { pathname } = url
    const matched = match<{ id: string }>("/:user/status/:id")(pathname)
    if (!matched) return
    return `<tweet id="${matched.params.id}" fullUrl="${url}" />`
  },
}
