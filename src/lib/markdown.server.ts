import Markdown from "markdown-it"
import * as shiki from "shiki"
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

const codeBlock = (
  md: Markdown,
  { highlighter }: { highlighter: shiki.Highlighter }
) => {
  const theme = highlighter.getTheme()
  const languages = highlighter.getLoadedLanguages()

  const highlight = (code: string, lang: string) => {
    if (!languages.includes(lang as any)) {
      return `<pre style="background-color:${theme.bg};color:${
        theme.fg
      };"><code>${md.utils.escapeHtml(code)}</code></pre>`
    }
    return highlighter.codeToHtml(code, { lang })
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const code = highlight(token.content, token.info)
    return `<div class="code" data-lang="${token.info}">${code}</div>`
  }
}

export const renderPageContent = async (content: string) => {
  const highlighter = await shiki.getHighlighter({
    theme: "vitesse-dark",
  })
  const md = new Markdown({
    html: false,
    linkify: true,
  })

  md.use(handleImages)
  md.use(codeBlock, { highlighter })

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
