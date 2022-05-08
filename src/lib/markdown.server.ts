import Markdown from "markdown-it"
import { getUserContentsUrl } from "./user-contents"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

const handleImages = (md: Markdown) => {
  const imageRule = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const url = token.attrGet("src")

    // Don't allow images from other domains.
    if (!url || isExternLink(url)) {
      return ""
    }

    token.attrSet("src", getUserContentsUrl(url))
    return imageRule(tokens, idx, options, env, self)
  }
}

export const renderPageContent = async (content: string) => {
  const md = new Markdown({
    html: false,
    linkify: true,
  })

  md.use(handleImages)

  const html = md.render(content)
  return { html }
}

const stripHTML = (html: string) => {
  return html.replace(/<(?:.|\n)*?>/gm, "")
}

export const getExcerpt = (content: string) => {
  const indexOfMore = content.indexOf("<!--more-->")
  const md = new Markdown({
    html: false,
    linkify: true,
  })
  if (indexOfMore > -1) {
    content = content.substring(0, indexOfMore)
    return stripHTML(md.render(content))
  }
  return stripHTML(md.render(content)).slice(0, 200)
}
