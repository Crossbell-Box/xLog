import type { Root } from "hast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const rehypeRemoveH1: Plugin<Array<void>, Root> = () => {
  return (tree: Root) => {
    visit(tree, (node, i, parent) => {
      if (node.type === "element") {
        if (node.tagName === "h1") {
          node.tagName = "h2"
        }
      }
    })
  }
}
