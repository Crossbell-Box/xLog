import Markdown from "markdown-it"
import { pluginCodeBlock } from "./plugin-code-block"
import { pluginExcerpt } from "./plugin-excerpt"
import { pluginImage } from "./plugin-image"

export type MarkdownEnv = {
  excerpt: string
  __internal: Record<string, any>
}

export const renderPageContent = async (content: string) => {
  const md = new Markdown({
    html: false,
    linkify: true,
  })

  md.use(pluginImage)
  md.use(pluginCodeBlock)
  md.use(pluginExcerpt)

  const env: MarkdownEnv = { excerpt: "", __internal: {} }
  const contentHTML = md.render(content, env)

  return { content, contentHTML, env }
}
