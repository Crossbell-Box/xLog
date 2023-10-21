export default function readingTime(text: string) {
  const chineseCharacters = text.replace(/[\x00-\xff]/g, "")
  const englishWords = text
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)

  const chineseReadingTime = chineseCharacters.length / 600
  const englishReadingTime = englishWords.length / 300

  return chineseReadingTime + englishReadingTime
}
