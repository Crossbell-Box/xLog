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
    "audio",
    "source",
    "mermaid",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] || []), "className", "style"],
    blockquote: allowedBlockquoteAttrs,
    video: ["src", "controls", "loop", "muted", "autoPlay", "playsInline"],
    audio: ["src", "controls", "loop", "muted", "autoPlay"],
    source: ["src", "type"],
    iframe: ["src", "allowFullScreen", "frameborder", "allow"],
  },
}

export default scheme
