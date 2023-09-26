import type { Root } from "hast"
import { fromHtml } from "hast-util-from-html"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

export interface Transformer {
  name: string
  shouldTransform: (url: URL) => boolean
  getHTML: (url: URL) => string | undefined
}

export const rehypeEmbed: Plugin<
  Array<{ transformers: Transformer[] }>,
  Root
> =
  ({ transformers }) =>
  (tree: Root) => {
    visit(tree, { tagName: "a" }, (node, i, parent) => {
      if (
        !parent ||
        !("tagName" in parent) ||
        parent.tagName !== "p" ||
        parent.children.length > 1 ||
        (node.children?.[0] as any)?.value !== node.properties?.href
      )
        return

      const href = node.properties?.href

      if (typeof href === "string") {
        let url
        try {
          url = new URL(href)
        } catch (error) {}
        if (!url) return
        for (const transformer of transformers) {
          if (transformer.shouldTransform(url)) {
            const html = transformer.getHTML(url)?.trim()
            if (!html) return
            const hast = fromHtml(html, { fragment: true }).children[0]
            Object.assign(parent, hast)
          }
        }
      }
    })
  }
