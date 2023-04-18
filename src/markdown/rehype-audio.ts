import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

import { toGateway } from "~/lib/ipfs-parser"

export const rehypeAudio: Plugin<Array<void>, Root> = () => {
  return (tree) => {
    visit(tree, { tagName: "audio" }, (node, i, parent) => {
      if (!node.properties) {
        return
      }

      const src = node.properties.src

      if (!src || typeof src !== "string") {
        return
      }

      node.properties.src = toGateway(src)

      if (parent) {
        parent.children[i!] = {
          type: "element",
          tagName: "audio",
          properties: {
            ...node.properties,
          },
          children: [],
        }
      }
    })
  }
}
