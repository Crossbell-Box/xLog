import {
  unstable_parseMultipartFormData,
  type UploadHandler,
} from "@remix-run/node"
import { nanoid } from "nanoid"
import { s3uploadFile } from "./s3.server"

export const uploadImage = async (
  request: Request,
  { userId }: { userId: string }
) => {
  const uploadHandler: UploadHandler = async ({ stream, mimetype }) => {
    const chunks = []
    for await (let chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    const filename = `${userId}/${nanoid()}.jpg`
    await s3uploadFile(filename, buffer, mimetype)
    return filename
  }

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  return Object.fromEntries(formData)
}
