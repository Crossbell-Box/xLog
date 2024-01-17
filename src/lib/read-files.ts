import { getDefaultSlug } from "~/lib/default-slug"

const makeArray = (value: any) => {
  if (Array.isArray(value)) {
    return value
  }
  if (value === undefined) {
    return []
  }
  return [value]
}

export const readFiles = async (files: FileList) => {
  const promises = []
  const { renderPageContent } = await import("~/markdown")
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
            const metadata = pageContent.toMetadata()
            resolve({
              title:
                metadata.frontMatter?.title ||
                file.name.replace(/\.[^/.]+$/, ""),
              type: file.type,
              size: file.size,
              date_published: new Date(
                metadata.frontMatter?.date || file.lastModified || Date.now(),
              ).toISOString(),
              slug:
                metadata.frontMatter?.permalink ||
                metadata.frontMatter?.slug ||
                getDefaultSlug(file.name),
              tags: makeArray(
                metadata.frontMatter?.tags || metadata.frontMatter?.categories,
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
