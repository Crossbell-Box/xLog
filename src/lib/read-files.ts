import { renderPageContent } from "~/markdown"
import { getDefaultSlug, getSiteLink } from "~/lib/helpers"

const makeArray = (value: any) => {
  if (Array.isArray(value)) {
    return value
  }
  if (value === undefined) {
    return []
  }
  return [value]
}

export const readFiles = (files: FileList) => {
  const promises = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    promises.push(
      new Promise(
        (
          resolve: (value: {
            title: string
            type: string
            size: number
            date_published: string
            slug: string
            tags: string[]
            content: string
          }) => void,
        ) => {
          const reader = new FileReader()
          reader.onload = () => {
            const pageContent = renderPageContent(reader.result as string)
            resolve({
              title:
                pageContent.frontMatter.title ||
                file.name.replace(/\.[^/.]+$/, ""),
              type: file.type,
              size: file.size,
              date_published: new Date(
                pageContent.frontMatter.date || file.lastModified || Date.now(),
              ).toISOString(),
              slug:
                pageContent.frontMatter.permalink || getDefaultSlug(file.name),
              tags: makeArray(
                pageContent.frontMatter.tags ||
                  pageContent.frontMatter.categories,
              ),
              content: reader.result as string,
            })
          }
          reader.readAsText(file)
        },
      ),
    )
  }

  return Promise.all(promises)
}
