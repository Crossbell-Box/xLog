import { nanoid } from "nanoid"
import path from "path"
import busboy, { FileInfo } from "busboy"
import { s3uploadFile } from "./s3.server"
import { IncomingMessage } from "http"

type File = { name: string; buffer: Buffer; info: FileInfo }

export const uploadImage = async (
  req: IncomingMessage,
  { userId }: { userId: string }
) => {
  const filePromises: Promise<void>[] = []
  const { files, fields } = await new Promise<{
    files: File[]
    fields: Record<string, any>
  }>((resolve, reject) => {
    const bb = busboy({ headers: req.headers, highWaterMark: 2 * 1024 * 1024 })

    const fields: Record<string, any> = {}
    const files: File[] = []

    bb.on("file", async (name, file, info) => {
      const fn = async () => {
        const chunks = []
        for await (let chunk of file) {
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        files.push({ name, buffer, info })
      }
      filePromises.push(fn())
    })

    bb.on("field", (name, val) => {
      fields[name] = val
    })

    const onEnd = (err?: Error) => {
      if (err) return reject(err)
      resolve({ files, fields })
    }

    bb.on("close", onEnd)

    bb.on("error", (error) => reject(error))

    req.pipe(bb)
  })

  await Promise.all(filePromises)

  await Promise.all(
    files.map(async (file) => {
      const saveAs = `${userId}/${nanoid()}${
        path.extname(file.info.filename) || ".jpg"
      }`
      await s3uploadFile(saveAs, file.buffer, file.info.mimeType)
      fields[file.name] = saveAs
    })
  )

  return fields
}
