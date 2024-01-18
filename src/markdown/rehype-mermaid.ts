import type { Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const rehypeMermaid: Plugin<[], Root> = () => (tree: Root) => {
  visit(tree, { tagName: "code" }, (node, i, parent) => {
    if (
      Array.isArray(node.properties.className) &&
      node.properties.className.includes("language-mermaid") &&
      parent?.type === "element"
    ) {
      parent.tagName = "mermaid"
      node.tagName = "div"
    }
  })
}
