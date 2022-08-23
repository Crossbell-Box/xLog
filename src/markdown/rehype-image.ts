import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { getUserContentsUrl } from "~/lib/user-contents"
import { toGateway } from "~/lib/ipfs-parser"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export const rehypeImage: Plugin<Array<void>, Root> = () => {
  return (tree) => {
    visit(tree, { tagName: "img" }, (node) => {
      if (!node.properties) return

      let url = node.properties.src

      if (!url || typeof url !== "string") {
        return
      }

      const ipfsUrl = toGateway(url)
      node.properties.src = ipfsUrl
      url = ipfsUrl

      if (isExternLink(url)) {
        if (!url.startsWith("https:")) {
          throw new Error(`External image url must start with https`)
        }
        return
      }

      node.properties.src = getUserContentsUrl(url)
    })
  }
}
