import { Plugin } from "unified"
import { Root } from "remark-gfm"
import { visit } from "unist-util-visit"

export const remarkMermaid: Plugin<Array<void>, Root> = () => (tree, file) => {
  visit(tree, (node) => {
    if (node.type === "code" && node.lang === "mermaid") {
      // @ts-ignore
      node.type = "html"
      node.value = `<pre class="mermaid" data-mermaid='true'>${node.value}</pre>`
    }
  })
}
