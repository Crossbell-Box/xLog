import Markdown from "markdown-it"

export const renderPageContent = async (content: string) => {
  const md = new Markdown({
    html: false,
    linkify: true,
  })
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
