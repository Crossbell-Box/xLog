import NodeID3 from "node-id3"
import toast from "react-hot-toast"

import { type EditorView } from "@codemirror/view"

import { MAXIMUM_FILE_SIZE } from "~/lib/constants"
import { UploadFile } from "~/lib/upload-file"

import type { ICommand } from "."
import { wrapExecute } from "./helper"

export async function editorUpload(file: File, view: EditorView) {
  const toastId = toast.loading("Uploading...")
  try {
    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("audio/") &&
      !file.type.startsWith("video/")
    ) {
      throw new Error("You can only upload images, audios and videos")
    }

    const uploadFilesizeInMB = file.size / 1024 / 1024

    if (uploadFilesizeInMB > MAXIMUM_FILE_SIZE) {
      toast.error(
        `File Size is too big. It should be less than ${MAXIMUM_FILE_SIZE} MB`,
        {
          id: toastId,
        },
      )
      return
    }

    const { key } = await UploadFile(file)
    toast.success("Uploaded!", {
      id: toastId,
    })
    if (file.type.startsWith("image/")) {
      wrapExecute({
        view,
        prepend: "",
        append: `
![${file.name.replace(/\.\w+$/, "")}](${key})
`,
      })
    } else if (file.type.startsWith("audio/")) {
      const fileArrayBuffer = await file.arrayBuffer()
      const fileBuffer = Buffer.from(fileArrayBuffer)
      const tags = NodeID3.read(fileBuffer)
      const name = tags.title ?? file.name
      const artist = tags.artist
      const cover = await (async () => {
        const image = tags.image
        if (!image || typeof image === "string") return image

        const toastId = toast.loading("Uploading cover...")
        const { key } = await UploadFile(
          new Blob([image.imageBuffer], { type: image.type.name }),
        )
        toast.success("Uploaded cover!", {
          id: toastId,
        })
        return key
      })()
      wrapExecute({
        view,
        prepend: "",
        append: `
<audio src="${key}" name="${name}" ${artist ? `artist="${artist}"` : ""} ${
          cover ? `cover="${cover}"` : ""
        }></audio>
`,
      })
    } else if (file.type.startsWith("video/")) {
      wrapExecute({
        view,
        prepend: "",
        append: `
<video>
  <source src="${key}" type="${file.type}" />
</video>
`,
      })
    } else if (file.type === "text/plain") {
      wrapExecute({
        view,
        prepend: "",
        append: key,
      })
    } else {
      throw new Error("Unknown upload file type")
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message, { id: toastId })
    }
  }
}

export const Multimedia: ICommand = {
  name: "upload-multimedia",
  label: "Upload Image, Audio or Video",
  icon: "i-mingcute-photo-album-line",
  execute: ({ view }) => {
    const input = document.createElement("input")
    input.type = "file"
    input.addEventListener("change", async (e: any) => {
      const file = e.target?.files?.[0]
      await editorUpload(file, view)
      input.remove()
    })
    input.click()
  },
}
