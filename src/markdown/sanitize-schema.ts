import { defaultSchema } from "rehype-sanitize"
import { allowedBlockquoteAttrs } from "./remark-callout"

const scheme = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "video",
    "iframe",
    "style",
    "youtube",
    "toc",
    "anchor",
    "mention",
  ],
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), "className", "style", "id"],
    code: ["className"],
    blockquote: allowedBlockquoteAttrs,
    video: [
      "className",
      "src",
      "controls",
      "loop",
      "muted",
      "autoplay",
      "playsinline",
    ],
    iframe: [
      "className",
      "src",
      "allowFullScreen",
      "frameborder",
      "width",
      "height",
      "allow",
      "style",
    ],
  },
}

export default scheme
