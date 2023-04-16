import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { getUserContentsUrl } from "~/lib/user-contents"
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

      let url = src
      const ipfsUrl = toGateway(url)
      node.properties.src = ipfsUrl
      url = ipfsUrl

      node.properties.src = getUserContentsUrl(url)

      if (parent) {
        const coverRaw = node.properties.cover
        const cover =
          typeof coverRaw === "string" ? toGateway(coverRaw) : undefined

        parent.children[i!] = {
          type: "element",
          tagName: "audio",
          properties: {
            src: url,
          },
          // children array format:
          // artist - name - cover
          children: [
            {
              type: "text",
              value: `${node.properties.artist}`,
            },
            {
              type: "text",
              value: `${node.properties.name}`,
            },
            {
              type: "text",
              value: cover ?? "",
            },
          ],
        }
      }
    })
  }
}
