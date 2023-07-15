import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

import { IS_PROD } from "~/lib/constants"
import { toGateway } from "~/lib/ipfs-parser"

import { MarkdownEnv } from "."

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export const rehypeImage: Plugin<Array<{ env: MarkdownEnv }>, Root> = ({
  env,
}) => {
  return (tree: Root) => {
    let first = true
    visit(tree, { tagName: "img" }, (node) => {
      if (!node.properties) return

      let url = node.properties.src

      if (!url || typeof url !== "string") {
        return
      }

      const ipfsUrl = toGateway(url)
      node.properties.src = ipfsUrl
      url = ipfsUrl

      if (first) {
        env.cover = url
        first = false
      }

      if (isExternLink(url)) {
        if (!url.startsWith("https:") && IS_PROD) {
          console.error(`External image url must start with https: ${url}`)
          url.replace(/^http:/, "https:")
        }
        return
      }

      node.properties.src = url
    })
  }
}
