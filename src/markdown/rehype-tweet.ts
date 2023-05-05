import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const rehypeTweet: Plugin<Array<void>, Root> = () => (tree) => {
  visit(tree, { tagName: "a" }, (node) => {
    // https://twitter.com/_xLog/status/1653881175033651201
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
