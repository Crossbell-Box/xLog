import { calculateTokens } from "./calculate-tokens"
import { Language } from "./types"

function getTolerantCount(textLength: "4k" | "16k"): number {
  const ratio = 0.8

  if (textLength == "4k") {
    return 4000 * ratio
  }

  return 16000
}

// TODO: This is a temporary solution. Because we don't know the language of the original text, we can't calculate the tokens accurately. Currently, only "Chinese to other languages" is supported.
export function llmModelSwitcherByTextLength(
  text: string,
  options: {
    // If true, include the response in the text length calculation with the specified language
    includeResponse?: { lang: Language }
  } = {},
): {
  modelSize: "4k" | "16k" | undefined
  tokens: number
} {
  const { includeResponse } = options
  const tokens = calculateTokens(text)

  const langRatioMapping: { [key in Language]: number } = {
    en: 1.6,
    ja: 1.25,
    zh: 1,
    "zh-TW": 1,
  }

  const finalCount =
    tokens / (includeResponse ? langRatioMapping[includeResponse.lang] : 1)

  if (finalCount < getTolerantCount("4k")) {
    return {
      modelSize: "4k",
      tokens,
    }
  } else if (finalCount < getTolerantCount("16k")) {
    return {
      modelSize: "16k",
      tokens,
    }
  }

  return {
    modelSize: undefined,
    tokens,
  }
}
