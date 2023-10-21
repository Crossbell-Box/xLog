import type { Root } from "hast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

import { toGateway } from "~/lib/ipfs-parser"

import { MarkdownEnv } from "."

export const rehypeVideo: Plugin<Array<{ env: MarkdownEnv }>, Root> = ({
  env,
}) => {
  return (tree: Root) => {
    let first = true
    visit(tree, { tagName: "video" }, (node, i, parent) => {
      if (!node.properties) {
        return
      }

      for (const child of node.children) {
        if (child.type === "element" && child.tagName === "source") {
          if (!child.properties) {
            continue
          }

          const src = child.properties.src

          if (!src || typeof src !== "string") {
            continue
          }

          child.properties.src = toGateway(src)
        }
      }
    })
  }
}
