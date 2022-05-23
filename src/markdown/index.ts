import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeRaw from "rehype-raw"
import rehypePrism from "rehype-prism-plus"
import { rehypeImage } from "./rehype-image"
import { remarkExcerpt } from "./remark-excerpt"
import { rehypeTable } from "./rehype-table"
import { allowedBlockquoteAttrs, remarkCallout } from "./remark-callout"

export type MarkdownEnv = {
  excerpt: string
  __internal: Record<string, any>
}

export type Rendered = {
  contentHTML: string
  excerpt: string
}

export const renderPageContent = async (content: string): Promise<Rendered> => {
  const env: MarkdownEnv = { excerpt: "", __internal: {} }

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm, {})
    .use(remarkExcerpt, { env })
    .use(remarkCallout)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeImage)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        code: [["className"]],
        blockquote: allowedBlockquoteAttrs,
      },
    })
    .use(rehypePrism)
    .use(rehypeTable)
    .use(rehypeStringify)
    .process(content)

  const contentHTML = result.toString()

  return { contentHTML, excerpt: env.excerpt }
}
