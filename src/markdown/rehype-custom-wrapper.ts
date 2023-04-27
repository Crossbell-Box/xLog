import { Root } from "hast"
import { visit } from "unist-util-visit"

// WHAT IS THIS?
// Wrap some tags with a custom container so that they can
// be replaced by rehype-react and avoid being modified by
// intermediary processes (such as rehype-raw).

export const allowedCustomWrappers = ["mermaid"]

export interface IDefaultRulesItem {
  test: (node: any) => boolean
  handler: (node: any) => void
}

export const defaultRules: IDefaultRulesItem[] = [
  // 1. mermaid
  // rehype-raw will split the node into multiple nodes
  // if it contains html tags. (e.g. <br />)
  {
    test: (node: any) =>
      node.type === "raw" && node.value.startsWith("<mermaid>"),
    handler: (node: any) => {
      node.type = "element"
      node.tagName = "mermaid"
      node.children = [
        {
          type: "text",
          value: /<mermaid>([\s\S]*)<\/mermaid>/.exec(node.value)?.[1],
        },
      ]
    },
  },
]

export const rehypeCustomWrapper = (
  options: { rules?: IDefaultRulesItem[] } = {},
) => {
  const rules = options && options.rules ? options.rules : defaultRules

  return function transformer(tree: Root) {
    visit(tree, (node: any) => {
      for (let rule of rules) {
        if (rule.test(node)) {
          rule.handler(node)
          break
        }
      }
    })
  }
}
