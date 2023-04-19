import type { Root } from "hast"
import jsYaml from "js-yaml"
import { Result as TocResult, toc } from "mdast-util-toc"
import { ReactElement, createElement } from "react"
import { Element } from "react-scroll"
import { refractor } from "refractor"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeInferDescriptionMeta from "rehype-infer-description-meta"
import rehypeKatex from "rehype-katex"
import rehypePrismGenerator from "rehype-prism-plus/generator"
import rehypeRaw from "rehype-raw"
import rehypeReact from "rehype-react"
import rehypeRewrite from "rehype-rewrite"
import rehypeSanitize from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkBreaks from "remark-breaks"
import remarkDirective from "remark-directive"
import remarkDirectiveRehype from "remark-directive-rehype"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import { APlayer } from "~/components/ui/APlayer"
import { ZoomedImage } from "~/components/ui/Image"
import { Mention } from "~/components/ui/Mention"
import { Mermaid } from "~/components/ui/Mermaid"

import { rehypeAudio } from "./rehype-audio"
import { rehypeImage } from "./rehype-image"
import { rehypeTable } from "./rehype-table"
import { rehypeWrapCode } from "./rehype-wrap-code"
import { rehypeExternalLink } from "./rehyper-external-link"
import { remarkCallout } from "./remark-callout"
import { remarkMermaid } from "./remark-mermaid"
import { remarkYoutube } from "./remark-youtube"
import sanitizeScheme from "./sanitize-schema"

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
      .use(remarkBreaks)
      .use(remarkFrontmatter, ["yaml"])
      .use(() => (tree) => {
        const yaml = tree.children.find((node) => node.type === "yaml")
        if ((yaml as any)?.value) {
          try {
            env.frontMatter = jsYaml.load((yaml as any)?.value) as Record<
              string,
              any
            >
          } catch (e) {
            console.error(e)
          }
        }
      })
      .use(() => (tree) => {
        env.toc = toc(tree, { tight: true, ordered: true })
      })
      .use(remarkGfm, {
        singleTilde: false,
      })
      .use(remarkCallout)
      .use(remarkDirective)
      .use(remarkDirectiveRehype)
      .use(remarkYoutube)
      .use(remarkMermaid)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify)
      .use(rehypeRaw)
      .use(rehypeImage, { env })
      .use(rehypeAudio)
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
                className: ["i-mingcute:link-line"],
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
      .use(rehypeSanitize, sanitizeScheme)
      .use(rehypePrism, {
        ignoreMissing: true,
        showLineNumbers: true,
      })
      .use(rehypeTable)
      .use(rehypeExternalLink)
      .use(rehypeWrapCode)
      .use(rehypeInferDescriptionMeta)
      .use(rehypeRewrite, {
        selector: "p, li",
        rewrite: (node: any) => {
          if (node.children) {
            node.children = node.children.flatMap((child: any) => {
              if (child.type === "text") {
                const mentionRegex = /(@[\w-]+)/g
                if (mentionRegex.test(child.value)) {
                  const parts = child.value.split(mentionRegex)
                  return parts.map((part: string) => {
                    if (part.startsWith("@")) {
                      return {
                        type: "element",
                        tagName: "mention",
                        children: [{ type: "text", value: part }],
                      }
                    } else {
                      return {
                        type: "text",
                        value: part,
                      }
                    }
                  })
                } else {
                  return child
                }
              } else {
                return child
              }
            })
          }
        },
      })
      .use(rehypeKatex) // There may be $ symbol parsing errors
      .use(html ? () => (tree: any) => {} : rehypeReact, {
        createElement: createElement,
        components: {
          img: ZoomedImage,
          anchor: Element,
          mention: Mention,
          mermaid: Mermaid,
          audio: APlayer,
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
    excerpt: result?.data.meta.description,
    frontMatter: env.frontMatter,
    cover: env.cover,
    toc: env.toc,
    tree: env.tree,
  }
}
