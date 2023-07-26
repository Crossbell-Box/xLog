import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

import { toGateway } from "~/lib/ipfs-parser"

import { MarkdownEnv } from "."

export const rehypeAudio: Plugin<Array<{ env: MarkdownEnv }>, Root> = ({
  env,
}) => {
  return (tree: Root) => {
    let first = true
    visit(tree, { tagName: "audio" }, (node, i, parent) => {
      if (!node.properties) {
        return
      }

      const src = node.properties.src

      if (!src || typeof src !== "string") {
        return
      }

      node.properties.src = toGateway(src)

      if (node.properties.cover && typeof node.properties.cover === "string") {
        const coverIpfsUrl = toGateway(node.properties.cover)
        node.properties.cover = coverIpfsUrl
        env.images.push(coverIpfsUrl)
      }

      if (first) {
        if (
          !env.cover &&
          node.properties.cover &&
          typeof node.properties.cover === "string"
        ) {
          env.cover = node.properties.cover
        }
        env.audio = node.properties.src
        first = false
      }

      if (
        parent &&
        parent.type === "element" &&
        i !== null &&
        i !== undefined
      ) {
        parent.tagName = "div"
        parent.children[i] = {
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
