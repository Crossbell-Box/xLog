import { Plugin } from "unified"
import { Root } from "remark-gfm"
import { visit } from "unist-util-visit"

export const remarkYoutube: Plugin<Array<void>, Root> = () => (tree, file) => {
  visit(tree, (node) => {
    if (
      node.type === "textDirective" ||
      node.type === "leafDirective" ||
      node.type === "containerDirective"
    ) {
      if (node.name !== "youtube") return

      const data = node.data || (node.data = {})
      const attributes = node.attributes || {}
      const id = attributes.id

      if (node.type === "textDirective")
        file.fail("Text directives for `youtube` not supported", node)
      if (!id) file.fail("Missing video id", node)

      data.hName = "div"
      data.hProperties = {
        className: ["xlog-post-content-youtube"],
        style: "position: relative; padding-bottom: 56.25%; height: 0;",
      }

      node.children = [
        {
          type: "leafDirective",
          data: {
            hName: "iframe",
            hProperties: {
              src: "https://www.youtube.com/embed/" + id,
              width: 728,
              height: 409.5,
              frameBorder: 0,
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowFullScreen: true,
              title: "YouTube video player",
              style:
                "position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
            },
          },
          children: [],
          name: "iframe",
        },
      ]
    }
  })
}
