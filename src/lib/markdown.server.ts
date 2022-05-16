import Markdown from "markdown-it"
import Prism from "prismjs"
import loadLanguages from "prismjs/components/index"
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

const codeBlock = (md: Markdown) => {
  const highlight = (code: string, lang: string) => {
    if (lang === "vue" || lang === "svelte") {
      lang = "html"
    }
    loadLanguages(lang)
    const grammer = Prism.languages[lang]
    const html = grammer
      ? `<pre><code>${Prism.highlight(code, grammer, lang)}</code></pre>`
      : `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`

    return html
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const code = highlight(token.content, token.info)
    return `<div class="code" data-lang="${token.info}">${code}</div>`
  }
}

export const renderPageContent = async (content: string) => {
  const md = new Markdown({
    html: false,
    linkify: true,
  })

  md.use(handleImages)
  md.use(codeBlock)

  const html = md.render(content)
  return { html }
}

const stripHTML = (html: string) => {
  return html.replace(/<(?:.|\n)*?>/gm, "")
}

export const getAutoExcerpt = (content: string) => {
  const indexOfMore = content.indexOf("<!--more-->")
  const md = new Markdown({
    html: false,
    linkify: true,
  })
  if (indexOfMore > -1) {
    content = content.substring(0, indexOfMore)
    return stripHTML(md.render(content))
  }
  return stripHTML(md.render(content)).slice(0, 400)
}
