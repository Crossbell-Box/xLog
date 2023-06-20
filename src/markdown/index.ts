import jsYaml from "js-yaml"
import type { Root } from "mdast"
import { Result as TocResult, toc } from "mdast-util-toc"
import dynamic from "next/dynamic"
import { ReactElement, createElement } from "react"
import { toast } from "react-hot-toast"
import { refractor } from "refractor"
import jsx from "refractor/lang/jsx"
import solidity from "refractor/lang/solidity"
import tsx from "refractor/lang/tsx"
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
import emoji from "remark-emoji"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import { transformers } from "./embed-transformers"
import { rehypeAudio } from "./rehype-audio"
import {
  allowedCustomWrappers,
  defaultRules,
  rehypeCustomWrapper,
} from "./rehype-custom-wrapper"
import { rehypeEmbed } from "./rehype-embed"
import { rehypeImage } from "./rehype-image"
import { rehypeTable } from "./rehype-table"
import { rehypeVideo } from "./rehype-video"
import { rehypeWrapCode } from "./rehype-wrap-code"
import { rehypeExternalLink } from "./rehyper-external-link"
import { remarkCallout } from "./remark-callout"
import { remarkMermaid } from "./remark-mermaid"
import { remarkPangu } from "./remark-pangu"
import { remarkYoutube } from "./remark-youtube"
import sanitizeScheme from "./sanitize-schema"

const AdvancedImage = dynamic(() => import("~/components/ui/AdvancedImage"))
const Style = dynamic(() => import("~/components/common/Style"))
const Mention = dynamic(() => import("~/components/ui/Mention"))
const Mermaid = dynamic(() => import("~/components/ui/Mermaid"))
const Tweet = dynamic(() => import("~/components/ui/Tweet"))
const GithubRepo = dynamic(() => import("~/components/ui/GithubRepo"))
const APlayer = dynamic(() => import("~/components/ui/APlayer"))

const DPlayer = dynamic(() => import("~/components/ui/DPlayer"))

export type MarkdownEnv = {
  excerpt: string
  frontMatter: Record<string, any>
  __internal: Record<string, any>
  cover: string
  audio: string
  toc: TocResult | null
  tree: Root | null
}

export type Rendered = {
  contentHTML: string
  element?: ReactElement
  excerpt: string
  frontMatter: Record<string, any>
  cover: string
  audio: string
  toc: TocResult | null
  tree: Root | null
}

refractor.alias("html", ["svelte", "vue"])
refractor.register(tsx)
refractor.register(jsx)
refractor.register(solidity)

const rehypePrism = rehypePrismGenerator(refractor)

export const renderPageContent = (
  content: string,
  html?: boolean,
  simple?: boolean,
): Rendered => {
  const env: MarkdownEnv = {
    excerpt: "",
    __internal: {},
    frontMatter: {},
    cover: "",
    audio: "",
    toc: null,
    tree: null,
  }

  let contentHTML = ""
  let result: any = null
  try {
    let pipeline = unified()
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
      .use(remarkGfm, {
        singleTilde: false,
      })
      .use(remarkCallout)
      .use(remarkDirective)
      .use(remarkDirectiveRehype)
      .use(remarkYoutube)
      .use(remarkMermaid)
      .use(remarkMath, {
        singleDollarTextMath: false,
      })
      .use(remarkPangu)
      .use(() => (tree) => {
        env.toc = toc(tree, { tight: true, ordered: true })
      })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(emoji)

    if (!html) {
      pipeline.use(rehypeCustomWrapper, {
        rules: defaultRules,
      })
    }

    pipeline
      .use(rehypeStringify)
      .use(rehypeRaw, { passThrough: allowedCustomWrappers })
      .use(rehypeImage, { env })
      .use(rehypeAudio, { env })
      .use(rehypeVideo, { env })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: "append",
        properties: {
          className: ["xlog-anchor"],
          ariaHidden: true,
          tabIndex: -1,
        },
        content(node) {
          return [
            {
              type: "text",
              value: "#",
            },
          ]
        },
      })
      .use(rehypeSanitize, simple ? undefined : sanitizeScheme)
      .use(rehypeTable)
      .use(rehypeExternalLink)
      .use(rehypeWrapCode)
      .use(rehypeInferDescriptionMeta)
      .use(rehypeEmbed, {
        transformers,
      })
      .use(rehypeRewrite, {
        selector: "p, li, h1",
        rewrite: (node: any) => {
          if (node.tagName === "h1") {
            node.tagName = "h2"
            return
          }
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
      .use(rehypePrism, {
        ignoreMissing: true,
        showLineNumbers: true,
      })
      // Move it to the end as it generates a lot of DOM and requires extensive traversal.
      .use(rehypeKatex)

    if (!html) {
      pipeline.use(rehypeReact, {
        createElement: createElement,
        components: {
          img: AdvancedImage,
          mention: Mention,
          mermaid: Mermaid,
          audio: APlayer,
          video: DPlayer,
          tweet: Tweet,
          "github-repo": GithubRepo,
          style: Style,
        } as any,
      })
    }

    result = pipeline
      .use(() => (tree: Root) => {
        env.tree = tree
      })
      .processSync(content)

    contentHTML = result.toString()
  } catch (e) {
    const error = e as Error
    toast.error(error?.message)
    console.error(e)
  }
  return {
    contentHTML,
    element: result?.result,
    excerpt: result?.data.meta.description,
    frontMatter: env.frontMatter,
    cover: env.cover,
    audio: env.audio,
    toc: env.toc,
    tree: env.tree,
  }
}
