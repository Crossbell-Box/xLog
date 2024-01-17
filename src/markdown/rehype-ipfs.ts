import type { Root } from "hast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

import { toGateway } from "~/lib/ipfs-parser"

const tags = ["video", "audio", "img", "source"]

export const rehypeIpfs: Plugin<Array<void>, Root> = () => {
  return (tree: Root) => {
    visit(tree, (node, i, parent) => {
      if (node.type === "element") {
        if (tags.includes(node.tagName)) {
          if (typeof node.properties.src === "string") {
            node.properties.src = toGateway(node.properties.src)
          }
        }
      }
    })
  }
}
