import type { Root as HashRoot } from "hast"
import { toHtml } from "hast-util-to-html"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import jsYaml from "js-yaml"
import type { Root as MdashRoot } from "mdast"
import { toc, Result as TocResult } from "mdast-util-toc"
import dynamic from "next/dynamic"
import { toast } from "react-hot-toast"
// @ts-expect-error: untyped.
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { refractor } from "refractor"
import langJsx from "refractor/lang/jsx"
import langSolidity from "refractor/lang/solidity"
import langTsx from "refractor/lang/tsx"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeInferDescriptionMeta from "rehype-infer-description-meta"
import rehypeKatex from "rehype-katex"
import rehypePrismGenerator from "rehype-prism-plus/generator"
import rehypeRaw, { Options as RehypeRawOptions } from "rehype-raw"
import rehypeRewrite from "rehype-rewrite"
import rehypeSanitize from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import remarkBreaks from "remark-breaks"
import remarkDirective from "remark-directive"
import remarkDirectiveRehype from "remark-directive-rehype"
import emoji from "remark-emoji"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkGithubAlerts from "remark-github-alerts"
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"

// @ts-expect-error
import remarkCalloutDirectives from "@microflash/remark-callout-directives"

import AdvancedImage from "~/components/ui/AdvancedImage"
import { isServerSide } from "~/lib/utils"

import { transformers } from "./embed-transformers"
import {
  allowedCustomWrappers,
  defaultRules,
  rehypeCustomWrapper,
} from "./rehype-custom-wrapper"
import { rehypeEmbed } from "./rehype-embed"
import { rehypeIpfs } from "./rehype-ipfs"
import { rehypeTable } from "./rehype-table"
import { rehypeWrapCode } from "./rehype-wrap-code"
import { rehypeExternalLink } from "./rehyper-external-link"
import { remarkMermaid } from "./remark-mermaid"
import { remarkPangu } from "./remark-pangu"
import { remarkYoutube } from "./remark-youtube"
import sanitizeScheme from "./sanitize-schema"

const Style = dynamic(() => import("~/components/common/Style"))
const Mention = dynamic(() => import("~/components/ui/Mention"))
const Mermaid = dynamic(() => import("~/components/ui/Mermaid"))
const Tweet = dynamic(() => import("~/components/ui/Tweet"))
const GithubRepo = dynamic(() => import("~/components/ui/GithubRepo"))
const XLogPost = dynamic(() => import("~/components/ui/XLogPost"))
const APlayer = dynamic(() => import("~/components/ui/APlayer"))
const DPlayer = dynamic(() => import("~/components/ui/DPlayer"))

refractor.alias("html", ["svelte", "vue"])
refractor.register(langTsx)
refractor.register(langJsx)
refractor.register(langSolidity)
const rehypePrism = rehypePrismGenerator(refractor)

export const renderPageContent = (
  content: string,
  htmlMode?: boolean,
  strictMode?: boolean,
) => {
  let hastTree: HashRoot | undefined = undefined
  let mdastTree: MdashRoot | undefined = undefined
  try {
    const pipeline = unified()
      .use(remarkParse)
      .use(remarkGithubAlerts) // make sure this is before remarkBreaks
      .use(remarkBreaks)
      .use(remarkFrontmatter, ["yaml"])
      .use(remarkGfm, {
        singleTilde: false,
      })
      .use(remarkDirective)
      .use(remarkDirectiveRehype)
      .use(remarkCalloutDirectives)
      .use(remarkYoutube)
      .use(remarkMermaid)
      .use(remarkMath, {
        singleDollarTextMath: false,
      })
      .use(remarkPangu)
      .use(emoji)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeCustomWrapper, {
        rules: defaultRules,
      })
      .use(rehypeIpfs)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: "append",
        properties: {
          className: "xlog-anchor",
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
      .use(rehypeSanitize, strictMode ? undefined : sanitizeScheme)
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
      .use(rehypeRaw, {
        passThrough: allowedCustomWrappers,
      } as RehypeRawOptions)
      // Move it to the end as it generates a lot of DOM and requires extensive traversal.
      .use(rehypeKatex, {
        strict: false,
      })
      .use(rehypePrism, {
        ignoreMissing: true,
        showLineNumbers: true,
      })

    const file = new VFile(content)

    // markdown abstract syntax tree
    mdastTree = pipeline.parse(file)
    // hypertext abstract syntax tree
    hastTree = pipeline.runSync(mdastTree, file)
  } catch (e) {
    const error = e as Error
    console.error(e)
    if (!isServerSide()) {
      toast.error(error?.message)
    }
  }

  let html: string | undefined = undefined
  let element: JSX.Element | undefined = undefined
  let frontMatter: Record<string, any> | undefined = undefined
  let tocResult: TocResult | undefined = undefined
  let images: string[] = []
  let audio: string | undefined = undefined

  if (hastTree && mdastTree) {
    // frontMatter
    visit(mdastTree, (node, index, parent) => {
      if (node.type === "yaml") {
        frontMatter = jsYaml.load(node.value) as Record<string, any>
      }
    })

    visit(hastTree, (node, index, parent) => {
      if (node.type === "element") {
        if (node.tagName === "img" && typeof node.properties.src === "string") {
          images.push(node.properties.src)
        }
        if (node.tagName === "audio") {
          if (typeof node.properties.cover === "string") {
            images.push(node.properties.cover)
          }
          if (!audio && typeof node.properties.src === "string") {
            audio = node.properties.src
          }
        }
      }
    })

    tocResult = toc(mdastTree, {
      tight: true,
      ordered: true,
    })

    html = toHtml(hastTree)

    element = toJsxRuntime(hastTree, {
      Fragment,
      components: {
        img: AdvancedImage,
        mention: Mention,
        mermaid: Mermaid,
        audio: APlayer,
        video: DPlayer,
        tweet: Tweet,
        "github-repo": GithubRepo,
        "xlog-post": XLogPost,
        style: Style,
      },
      ignoreInvalidStyle: true,
      jsx,
      jsxs,
      passKeys: true,
      passNode: true,
    })
  }

  return {
    html,
    element,
    frontMatter,
    toc: tocResult,
    cover: images[0],
    images,
    audio,
    tree: {},
  }
}
