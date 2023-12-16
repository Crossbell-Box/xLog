import { toHtml } from "hast-util-to-html"
import DOMPurify from "isomorphic-dompurify"
import katex from "katex"
import type { List } from "mdast"
import { toHast } from "mdast-util-to-hast"
import type { Result as TocResult } from "mdast-util-toc"

import PostTocItems from "./PostTocItems"

const inlineElements = ["delete", "strong", "emphasis", "inlineCode"]

function getLinkNode(node: any): List["children"] {
  if (node.type === "link") return node.children
  else return getLinkNode(node.children[0])
}

function generateContent(items: TocResult["map"]) {
  items?.children?.forEach((item) => {
    item.children.forEach((child: any, i) => {
      const children = getLinkNode(child) || []
      let content = ""

      children.forEach((child: any) => {
        if (child.type === "inlineMath") {
          content += katex.renderToString(child.value, {
            output: "html",
            strict: false,
          })
        } else if (inlineElements.includes(child.type)) {
          content += toHtml(toHast(child) || [])
        } else {
          content += child.value
        }
      })
      child.content = DOMPurify.sanitize(content)
      if (child.type === "list") {
        generateContent(child)
      }
    })
  })
}

const PostToc = ({ data }: { data: TocResult }) => {
  generateContent(data?.map)

  return (
    <div className="xlog-post-toc absolute left-full pl-14 h-full top-0 lg:block hidden">
      <div
        className="sticky top-14 text-sm leading-loose whitespace-nowrap max-h-[calc(100vh-theme('spacing.28'))] truncate"
        style={{
          overflowY: "auto",
        }}
      >
        <PostTocItems items={data?.map} />
      </div>
    </div>
  )
}

export default PostToc
