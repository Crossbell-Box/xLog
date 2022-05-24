import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export const rehypeExternalLink: Plugin<Array<void>, Root> = () => {
  return (tree) => {
    visit(tree, { type: "element", tagName: "a" }, (node) => {
      if (!node.properties) return

      const url = node.properties.href

      if (!url || typeof url !== "string") {
        return
      }

      if (isExternLink(url)) {
        node.properties.target = "_blank"
        node.properties.rel = "noopener noreferrer"
      }
    })
  }
}
