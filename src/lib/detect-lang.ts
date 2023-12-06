import XRegExp from "xregexp"

import { Language } from "./types"

type Thresholds = Partial<Record<Language, number>>

const _thresholds: Thresholds = {
  en: 0.8,
  zh: 0.3,
  ja: 0.5,
}

export function detectLanguage(
  text: string,
  thresholds: Thresholds = _thresholds,
): Language {
  // Pre-process the text
  text = text.replace(/[\d\s\p{P}]/gu, "") // Remove numbers, whitespace, and punctuation

  // split into words
  const langs: Array<string | null> = text
    .trim()
    .split(/\s+/)
    .map((word) => {
      return detect(word, thresholds)
    })

  // pick the lang with the most occurrences
  const result = langs.reduce<{
    k: Record<string, number>
    max: string | null
  }>(
    (acc, el) => {
      if (el) {
        acc.k[el] = acc.k[el] ? acc.k[el] + 1 : 1
        acc.max = acc.max ? (acc.k[acc.max] < acc.k[el] ? el : acc.max) : el
      }
      return acc
    },
    { k: {}, max: null },
  )

  return result.max as Language

  function detect(text: string, thresholds: Thresholds): string | null {
    const scores: Record<string, number> = {}
    const regexes: Record<string, RegExp> = {
      en: XRegExp("\\p{Latin}", "gi"),
      zh: XRegExp("\\p{Han}", "gi"),
      ja: XRegExp("[\\p{Hiragana}\\p{Katakana}]", "gi"),
    }

    for (const [lang, regex] of Object.entries(regexes)) {
      const matches = XRegExp.match(text, regex) || []
      const score = matches.length / text.length
      if (score && score >= thresholds[lang as keyof Thresholds]!) {
        return lang
      }
      scores[lang] = score
    }

    if (Object.keys(scores).length === 0) return null

    // pick lang with highest percentage
    return Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b))
  }
}
