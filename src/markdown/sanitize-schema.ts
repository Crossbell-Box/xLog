import deepmerge from "deepmerge"
import { defaultSchema } from "rehype-sanitize"

const scheme = deepmerge(defaultSchema, {
  ...defaultSchema,
  tagNames: [
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
    "aside",
    ...["svg", "path", "circle"],
  ],
  attributes: {
    "*": ["className", "style"],
    video: ["src", "controls", "loop", "muted", "autoPlay", "playsInline"],
    audio: [
      "src",
      "controls",
      "loop",
      "muted",
      "autoPlay",
      "name",
      "artist",
      "cover",
      "lrc",
    ],
    source: ["src", "type"],
    iframe: ["src", "allowFullScreen", "frameborder", "allow"],
    svg: [
      "xmlns",
      "width",
      "height",
      "viewBox",
      "fill",
      "stroke",
      "strokeLineCap",
      "strokeLineJoin",
      "strokeWidth",
    ],
    path: ["d", "fill"],
    circle: ["cx", "cy", "r", "fill"],
  },
  protocols: {
    href: ["magnet"],
  },
})

export default scheme
