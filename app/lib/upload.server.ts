import {
  unstable_parseMultipartFormData,
  type UploadHandler,
} from "@remix-run/node"
import { nanoid } from "nanoid"
import path from "path"
import { s3uploadFile } from "./s3.server"

export const uploadImage = async (
  request: Request,
  { userId }: { userId: string }
) => {
  const uploadHandler: UploadHandler = async ({
    stream,
    mimetype,
    filename,
  }) => {
    const chunks = []
    for await (let chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    const saveAs = `${userId}/${nanoid()}${path.extname(filename) || ".jpg"}`
    await s3uploadFile(saveAs, buffer, mimetype)
    return saveAs
  }

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  return Object.fromEntries(formData)
}
