import { Plugin } from "unified"
import { Root } from "rehype-raw"
import { visit } from "unist-util-visit"

export const rehypeTable: Plugin<Array<void>, Root> = () => (tree) => {
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
