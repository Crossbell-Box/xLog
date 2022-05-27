import { Root } from "rehype-raw"
import { Plugin } from "unified"
import { u } from "unist-builder"
import { visit } from "unist-util-visit"

export const rehypeWrapCode: Plugin<Array<void>, Root> = () => {
  return (tree) => {
    visit(tree, { type: "element", tagName: "pre" }, (node, index, parent) => {
      if (parent && typeof index === "number") {
        const wrapper = u("element", {
          tagName: "div",
          properties: {
            className: "code-wrapper",
          },
          children: [
            u("element", {
              tagName: "button",
              properties: {
                type: "button",
                className: "copy-button",
              },
              children: [
                u("element", {
                  tagName: "span",
                  properties: {
                    className: "i-bxs-copy",
                  },
                  children: [],
                }),
                u("element", {
                  tagName: "span",
                  properties: {},
                  children: [u("text", "Copy")],
                }),
              ],
            }),
            node,
          ],
        })
        parent.children[index] = wrapper
      }
    })
  }
}
