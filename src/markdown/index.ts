import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import remarkFrontmatter from "remark-frontmatter"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeRaw from "rehype-raw"
import { refractor } from "refractor"
import rehypePrismGenerator from "rehype-prism-plus/generator"
import { rehypeImage } from "./rehype-image"
import { remarkExcerpt } from "./remark-excerpt"
import { rehypeTable } from "./rehype-table"
import { remarkCallout } from "./remark-callout"
import { rehypeExternalLink } from "./rehyper-external-link"
import { rehypeWrapCode } from "./rehype-wrap-code"
import jsYaml from "js-yaml"
import rehypeReact from "rehype-react"
import { createElement, ReactElement } from "react"
import { Image } from "~/components/ui/Image"
import remarkDirective from "remark-directive"
import remarkDirectiveRehype from "remark-directive-rehype"
import { remarkYoutube } from "./remark-youtube"
import sanitizeScheme from "./sanitize-schema"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { toc, Result as TocResult } from "mdast-util-toc"
import { Element } from "react-scroll"
import type { Root } from "hast"
import { Mention } from "~/components/ui/Mention"

export type MarkdownEnv = {
  excerpt: string
  frontMatter: Record<string, any>
  __internal: Record<string, any>
  cover: string
  toc: TocResult | null
  tree: Root | null
}

export type Rendered = {
  contentHTML: string
  element?: ReactElement
  excerpt: string
  frontMatter: Record<string, any>
  cover: string
  toc: TocResult | null
  tree: Root | null
}

refractor.alias("html", ["svelte", "vue"])

const rehypePrism = rehypePrismGenerator(refractor)

export const renderPageContent = (
  content: string,
  html?: boolean,
): Rendered => {
  const env: MarkdownEnv = {
    excerpt: "",
    __internal: {},
    frontMatter: {},
    cover: "",
    toc: null,
    tree: null,
  }

  let contentHTML = ""
  let result: any = null
  try {
    result = unified()
      .use(remarkParse)
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
      .use(() => (tree) => {
        env.toc = toc(tree, { tight: true, ordered: true })
      })
      .use(remarkGfm, {})
      .use(remarkExcerpt, { env })
      .use(remarkCallout)
      .use(remarkDirective)
      .use(remarkDirectiveRehype)
      .use(remarkYoutube)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify)
      .use(rehypeRaw)
      .use(rehypeImage, { env })
      .use(rehypeSanitize, sanitizeScheme)
      .use(rehypePrism, {
        ignoreMissing: true,
        showLineNumbers: true,
      })
      .use(rehypeTable)
      .use(rehypeExternalLink)
      .use(rehypeWrapCode)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        properties: {
          className: ["xlog-anchor"],
          ariaHidden: true,
          tabIndex: -1,
        },
        content(node) {
          return [
            {
              type: "element",
              tagName: "span",
              properties: {
                className: ["i-akar-icons:link-chain"],
              },
              children: [],
            },
            {
              type: "element",
              tagName: "anchor",
              properties: {
                name: node.properties?.id,
              },
              children: [],
            },
          ]
        },
      })
      .use(html ? () => (tree: any) => {} : rehypeReact, {
        createElement: createElement,
        components: {
          img: Image,
          anchor: Element,
          mention: Mention,
        } as any,
      })
      .use(() => (tree) => {
        env.tree = tree
      })
      .processSync(content)

    contentHTML = result.toString()
  } catch (error) {
    console.error(error)
  }
  return {
    contentHTML,
    element: result?.result,
    excerpt: env.excerpt,
    frontMatter: env.frontMatter,
    cover: env.cover,
    toc: env.toc,
    tree: env.tree,
  }
}
