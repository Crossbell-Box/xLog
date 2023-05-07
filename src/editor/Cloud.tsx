import toast from "react-hot-toast"

import { toGateway } from "~/lib/ipfs-parser"
import { UploadFile } from "~/lib/upload-file"

import { ICommand } from "."

const uploadResources = async (text: string) => {
  const markdownImageRegex = /!\[(.*)\]\((.+)\)/
  const match = text.match(markdownImageRegex)
  if (match) {
    const altText = match[1]
    const url = match[2]
    console.log({ url })
    const blob = await fetch(url, {
      mode: "no-cors",
    }).then((response) => response.blob())
    const key = (await UploadFile(blob)).key
    const newUrl = toGateway(key)
    return `![${altText}](${newUrl})`
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
