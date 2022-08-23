import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { toGateway } from "~/lib/ipfs-parser"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export const rehypeExternalLink: Plugin<Array<void>, Root> = () => {
  return (tree) => {
    visit(tree, { type: "element", tagName: "a" }, (node) => {
      if (!node.properties) return

      let url = node.properties.href

      if (!url || typeof url !== "string") {
        return
      }

      const ipfsUrl = toGateway(url)
      node.properties.href = ipfsUrl
      url = ipfsUrl

      if (isExternLink(url)) {
        node.properties.target = "_blank"
        node.properties.rel = "noopener noreferrer"
      }
    })
  }
}
