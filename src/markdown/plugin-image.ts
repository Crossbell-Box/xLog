import Markdown from "markdown-it"
import { getUserContentsUrl } from "~/lib/user-contents"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export const pluginImage = (md: Markdown) => {
  const imageRule = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const url = token.attrGet("src")

    if (!url) {
      return ""
    }

    if (isExternLink(url)) {
      if (!url.startsWith("https:")) {
        throw new Error(`External image url must start with https`)
      }
      return imageRule(tokens, idx, options, env, self)
    }

    token.attrSet("src", getUserContentsUrl(url))
    return imageRule(tokens, idx, options, env, self)
  }
}
