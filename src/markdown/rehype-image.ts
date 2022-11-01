import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { getUserContentsUrl } from "~/lib/user-contents"
import { toGateway } from "~/lib/ipfs-parser"
import { MarkdownEnv } from "."
import { IS_PROD } from "~/lib/constants"

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export const rehypeImage: Plugin<Array<{ env: MarkdownEnv }>, Root> = ({
  env,
}) => {
  return (tree) => {
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
          throw new Error(`External image url must start with https`)
        }
        return
      }

      node.properties.src = getUserContentsUrl(url)
    })
  }
}
