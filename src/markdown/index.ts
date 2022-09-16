import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import remarkFrontmatter from "remark-frontmatter"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeRaw from "rehype-raw"
import { refractor } from "refractor/lib/all"
import rehypePrismGenerator from "rehype-prism-plus/generator"
import { rehypeImage } from "./rehype-image"
import { remarkExcerpt } from "./remark-excerpt"
import { rehypeTable } from "./rehype-table"
import { allowedBlockquoteAttrs, remarkCallout } from "./remark-callout"
import { rehypeExternalLink } from "./rehyper-external-link"
import { rehypeWrapCode } from "./rehype-wrap-code"
import jsYaml from "js-yaml"

export type MarkdownEnv = {
  excerpt: string
  frontMatter: Record<string, any>
  __internal: Record<string, any>
  cover: string
}

export type Rendered = {
  contentHTML: string
  excerpt: string
  frontMatter: Record<string, any>
  cover: string
}

refractor.alias("html", ["svelte", "vue"])

const rehypePrism = rehypePrismGenerator(refractor)

export const renderPageContent = async (content: string): Promise<Rendered> => {
  const env: MarkdownEnv = {
    excerpt: "",
    __internal: {},
    frontMatter: {},
    cover: "",
  }

  const result = await unified()
    .use(remarkParse)
    .use(rehypeStringify)
    .use(remarkFrontmatter, ["yaml"])
    .use(() => (tree) => {
      const yaml = tree.children.find((node) => node.type === "yaml")
      try {
        env.frontMatter = jsYaml.load((yaml as any)?.value) as Record<
          string,
          any
        >
      } catch (e) {
        console.log(e)
      }
    })
    .use(remarkGfm, {})
    .use(remarkExcerpt, { env })
    .use(remarkCallout)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeImage, { env })
    .use(rehypeSanitize, {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), "video", "iframe"],
      attributes: {
        ...defaultSchema.attributes,
        div: [...(defaultSchema.attributes?.div || []), ["className"]],
        code: [["className"]],
        blockquote: allowedBlockquoteAttrs,
        video: [
          ["className"],
          ["src"],
          ["controls"],
          ["loop"],
          ["muted"],
          ["autoplay"],
          ["playsinline"],
        ],
        iframe: [
          ["className"],
          ["src"],
          ["allowfullscreen"],
          ["frameborder"],
          ["width"],
          ["height"],
          ["allow"],
        ],
      },
    })
    .use(rehypePrism, {
      ignoreMissing: true,
    })
    .use(rehypeTable)
    .use(rehypeExternalLink)
    .use(rehypeWrapCode)
    .process(content)

  const contentHTML = result.toString()

  return {
    contentHTML,
    excerpt: env.excerpt,
    frontMatter: env.frontMatter,
    cover: env.cover,
  }
}
