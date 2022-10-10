import { Plugin } from "unified"
import { Root } from "remark-gfm"
import { visit } from "unist-util-visit"

const CALLOUT_RE = /^(TIP|WARN|SUCCESS|DANGER):(\n|$)/

export const remarkCallout: Plugin<Array<void>, Root> = () => (tree) => {
  visit(tree, { type: "blockquote" }, (node, index, parent) => {
    if (node.type !== "blockquote") return

    const firstChild = node.children[0]
    if (firstChild?.type === "paragraph") {
      const paragraphFirstChild = firstChild.children[0]
      if (
        paragraphFirstChild.type === "text" &&
        CALLOUT_RE.test(paragraphFirstChild.value)
      ) {
        const type = paragraphFirstChild.value.match(CALLOUT_RE)![1]
        const newValue = paragraphFirstChild.value.replace(CALLOUT_RE, "")
        // In the following case `newValue` will be empty empty
        // We should remove the paragraph
        // > TIP:
        // >
        // > some tip
        if (!newValue) {
          node.children.splice(0, 1)
        }
        paragraphFirstChild.value = newValue
        const className = `callout callout-${type.toLowerCase()}`
        node.data = {
          ...node.data,
          hProperties: {
            class: className,
          },
        }
      }
    }
  })
}

export const allowedBlockquoteAttrs: Array<[string, ...string[]]> = [
  [
    "className",
    "callout",
    "callout-tip",
    "callout-warn",
    "callout-success",
    "callout-danger",
  ],
]
