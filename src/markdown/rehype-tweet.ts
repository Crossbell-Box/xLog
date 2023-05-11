import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const rehypeTweet: Plugin<Array<void>, Root> = () => (tree) => {
  visit(tree, { tagName: "a" }, (node, i, parent) => {
    if (
      !parent ||
      !("tagName" in parent) ||
      parent.tagName !== "p" ||
      parent.children.length > 1
    )
      return

    const tweetRegex =
      /^https?:\/\/(?:www\.)?twitter\.com\/\w+\/status\/(\d+)(?:\?.*)?(?:#.*)?$/

    const href = node.properties?.href

    if (typeof href === "string") {
      const match = href.match(tweetRegex)
      if (match && match[0] === href) {
        const tweetId = match[1]
        node.tagName = "tweet"
        node.properties = {
          id: tweetId,
        }
      }
    }
  })
}
