import { useCallback } from "react"
import { UploadFile } from "../lib/upload-file"

export const useUploadFile = () => {
  const uploadFile = useCallback<UploadFile>(async (blob) => {
    return await UploadFile(blob)
  }, [])

  return uploadFile
}

export type UploadFile = (blob: Blob) => Promise<{ key: string }>
