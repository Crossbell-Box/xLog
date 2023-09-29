import type { Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const remarkMermaid: Plugin<[], Root> = () => (tree: Root) => {
  visit(tree, (node) => {
    if (node.type === "code" && node.lang === "mermaid") {
      // @ts-ignore
      node.type = "html"
      node.value = `<mermaid>${node.value}</mermaid>`
    }
  })
}
