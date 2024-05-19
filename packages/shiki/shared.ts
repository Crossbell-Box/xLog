import type { ShikiTransformer } from "shiki"

import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers"

export const shikiTransformers: ShikiTransformer[] = [
  transformerMetaHighlight(),
  transformerNotationDiff(),
  transformerNotationHighlight(),
]
