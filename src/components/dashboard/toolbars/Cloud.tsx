import toast from "react-hot-toast"

import { UploadFile } from "~/lib/upload-file"

import { ICommand } from "."

const uploadResources = async (text: string) => {
  const markdownHttpImagesRegex = /\!\[([^\]]*)\]\((?=(https:\/\/))([^)]+)\)/g
  const markdownHttpImageRegex = /\!\[([^\]]*)\]\((?=(https:\/\/))([^)]+)\)/
  const markdownHttpImages = text.match(markdownHttpImagesRegex)
  if (markdownHttpImages) {
    const markdownReplacementsArray = await Promise.all(
      markdownHttpImages.map(async (markdownHttpImage) => {
        const match = markdownHttpImage.match(markdownHttpImageRegex)!
        const altText = match[1]
        const url = match[3]
        const toastId = toast.loading(`Uploading ${altText || url}`)
        try {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(response.statusText)
          }
          const blob = await response.blob()
          const key = (await UploadFile(blob)).key
          toast.success(`Uploaded ${altText || url}!`, {
            id: toastId,
          })
          return {
            originalMarkdown: markdownHttpImage,
            newMarkdown: `![${altText}](${key})`,
          }
        } catch (error) {
          if (error instanceof Error) {
            toast.error(`Failed upload ${altText || url}, ${error.message}`, {
              id: toastId,
            })
          }
          console.error(error)
          return undefined
        }
      }),
    )
    return markdownReplacementsArray.reduce(
      (prev, cur) =>
        cur ? prev.replace(cur.originalMarkdown, cur.newMarkdown) : prev,
      text,
    )
  } else {
    return text
  }
}

export const Cloud: ICommand = {
  name: "cloud",
  label: "Upload All Images to IPFS",
  icon: "i-mingcute-upload-3-line",
  execute: async ({ view }) => {
    const docJson = view.state.doc.toJSON()
    const newDocJson = await Promise.all(
      docJson.map((line: string) => uploadResources(line)),
    )
    view.dispatch({
      changes: [
        {
          from: 0,
          to: view.state.doc.toString().length,
          insert: newDocJson.join("\n"),
        },
      ],
    })
  },
}
