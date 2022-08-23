import { useCallback } from "react"
import { UploadFile } from "../lib/upload-file"

export const useUploadFile = () => {
  const uploadFile = useCallback<UploadFile>(async (blob, filename) => {
    return await UploadFile(blob, filename)
  }, [])

  return uploadFile
}

export type UploadFile = (
  blob: Blob,
  filename: string,
) => Promise<{ key: string }>
