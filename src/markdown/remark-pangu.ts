import type { Root } from "mdast"
import pangu from "pangu"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

interface Options {
  text?: boolean
  inlineCode?: boolean
  link?: boolean
  image?: boolean
  definition?: boolean
  imageReference?: boolean
}

const defaultOptions: Options = {
  text: true,
  inlineCode: false,
  link: true,
  image: true,
  definition: true,
  imageReference: true,
}

function format(value: string) {
  if (!value) return value
  return pangu.spacing(value)
}

export const remarkPangu: Plugin<[], Root> =
  (options = {}) =>
  (tree: Root) => {
    const settings = Object.assign({}, defaultOptions, options)
    const subset = (Object.keys(settings) as Array<keyof Options>).filter(
      (k) => settings[k],
    ) as string[]

    visit(tree, (node) => {
      if (subset.includes(node.type)) {
        if (node.type === "text" || node.type === "inlineCode") {
          node.value = format(node.value)
        }

        if (
          (node.type === "link" ||
            node.type === "image" ||
            node.type === "definition") &&
          node.title
        ) {
          node.title = format(node.title)
        }

        if (
          (node.type === "image" || node.type === "imageReference") &&
          node.alt
        ) {
          node.alt = format(node.alt)
        }
      }
    })
  }
