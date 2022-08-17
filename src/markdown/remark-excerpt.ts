import { Plugin } from "unified"
import { MarkdownEnv } from "."
import { Root } from "remark-gfm"
import { toString as mdAstToString } from "mdast-util-to-string"

export const remarkExcerpt: Plugin<Array<{ env: MarkdownEnv }>, Root> =
  ({ env }) =>
  (tree) => {
    for (const node of tree.children) {
      if (node.type === "paragraph") {
        env.excerpt = mdAstToString(node, {
          includeImageAlt: false,
        }).slice(0, 140)
        if (env.excerpt) {
          break
        }
      }
    }
  }
