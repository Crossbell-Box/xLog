import Markdown from "markdown-it"
import { R2_URL } from "~/lib/env"
import { getUserContentsUrl } from "~/lib/user-contents"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

const ALLOW_IMAGE_ORIGINS = [
  "user-images.githubusercontent.com",
  "cdn.jsdelivr.net",
  "images.unsplash.com",
  "source.unsplash.com",
  R2_URL.replace(/^https?\:\/\//, ""),
]

export const pluginImage = (md: Markdown) => {
  const imageRule = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const url = token.attrGet("src")

    if (!url) {
      return ""
    }

    if (isExternLink(url)) {
      const { hostname } = new URL(url)
      if (!ALLOW_IMAGE_ORIGINS.includes(hostname)) {
        throw new Error(`Image from ${hostname} is not allowed`)
      }
      return imageRule(tokens, idx, options, env, self)
    }

    token.attrSet("src", getUserContentsUrl(url))
    return imageRule(tokens, idx, options, env, self)
  }
}
