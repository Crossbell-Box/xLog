const slugReservedWords = [
  "archives",
  "feed",
  "feed.xml",
  "preview",
  "tag",
  "tags",
  "sitemap.xml",
  "dashboard",
  "robots.txt",
  "nft",
  "sw.js",
  "manifest.json",
  "atom.xml",
  "search",
]

export const checkSlugReservedWords = (word: string) => {
  if (slugReservedWords.includes(word)) {
    return `Slug "${word}" is a reserved word`
  }
}
