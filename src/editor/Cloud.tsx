import toast from "react-hot-toast"

import { IPFS_PREFIX } from "~/lib/ipfs-parser"
import { UploadFile } from "~/lib/upload-file"

import { ICommand } from "."

const uploadResources = async (text: string) => {
  const markdownImageRegex = /!\[(.*)\]\((.+)\)/
  const match = text.match(markdownImageRegex)
  if (match) {
    const altText = match[1]
    const url = match[2]

    if (url.startsWith(IPFS_PREFIX)) {
      return text
    }

    const blob = await fetch(url, {
      mode: "no-cors",
    }).then((response) => response.blob())
    const key = (await UploadFile(blob)).key
    return `![${altText}](${key})`
  } else {
    return text
  }
}

export const Cloud: ICommand = {
  name: "cloud",
  label: "Upload All Images to IPFS",
  icon: "icon-[mingcute--upload-3-line]",
  execute: async ({ view }) => {
    const toastId = toast.loading("Uploading...")
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
    toast.success("Uploaded!", {
      id: toastId,
    })
  },
}
