import Markdown from "markdown-it"
import { pluginCodeBlock } from "./plugin-code-block"
import { pluginExcerpt } from "./plugin-excerpt"
import { pluginImage } from "./plugin-image"
import { pluginTable } from "./plugin-table"
import { pluginTaskList } from "./plugin-task-list"

export type MarkdownEnv = {
  excerpt: string
  __internal: Record<string, any>
}

export type Rendered = {
  contentHTML: string
  excerpt: string
}

export const renderPageContent = async (content: string): Promise<Rendered> => {
  const md = new Markdown({
    html: false,
    linkify: true,
  })

  md.use(pluginImage)
  md.use(pluginCodeBlock)
  md.use(pluginExcerpt)
  md.use(pluginTable)
  md.use(pluginTaskList)

  const env: MarkdownEnv = { excerpt: "", __internal: {} }
  const contentHTML = md.render(content, env)

  return { contentHTML, excerpt: env.excerpt }
}
