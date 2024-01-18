import type { Root } from "hast"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"

export const rehypeMention: Plugin<Array<void>, Root> = () => {
  return (tree: Root) => {
    visit(tree, (node, i, parent) => {
      if (node.type === "element") {
        if (node.tagName === "p" || node.tagName === "li") {
          if (node.children) {
            node.children = node.children.flatMap((child: any) => {
              if (child.type === "text") {
                const mentionRegex = /(@[\w-]+)/g
                if (mentionRegex.test(child.value)) {
                  const parts = child.value.split(mentionRegex)
                  return parts.map((part: string) => {
                    if (part.startsWith("@")) {
                      return {
                        type: "element",
                        tagName: "mention",
                        children: [{ type: "text", value: part }],
                      }
                    } else {
                      return {
                        type: "text",
                        value: part,
                      }
                    }
                  })
                } else {
                  return child
                }
              } else {
                return child
              }
            })
          }
        }
      }
    })
  }
}
