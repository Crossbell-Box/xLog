import { defaultSchema } from "rehype-sanitize"
import { allowedBlockquoteAttrs } from "./remark-callout"
// @ts-ignore
import type { Schema } from "hast-util-sanitize/lib"

const scheme: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "video",
    "iframe",
    "style",
    "youtube",
  ],
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div || []),
      ["className"],
      ["style"],
      ["id"],
    ],
    code: [["className"]],
    blockquote: allowedBlockquoteAttrs,
    video: [
      ["className"],
      ["src"],
      ["controls"],
      ["loop"],
      ["muted"],
      ["autoplay"],
      ["playsinline"],
    ],
    iframe: [
      ["className"],
      ["src"],
      ["allowFullScreen"],
      ["frameborder"],
      ["width"],
      ["height"],
      ["allow"],
    ],
  },
}

export default scheme
