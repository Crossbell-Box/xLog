import type { Root } from "hast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const rehypeTable: Plugin<Array<void>, Root> = () => (tree: Root) => {
  visit(tree, { tagName: "table" }, (node, i, parent) => {
    if (parent) {
      parent.children[i!] = {
        type: "element",
        tagName: "div",
        properties: { className: "table-wrapper" },
        children: [node],
      }
    }
  })
}
