import { useCallback } from "react"
import { Web3Storage } from "web3.storage"
import { IPFS_GATEWAY } from "../lib/env"

export const useUploadFile = () => {
  const uploadFile = useCallback<UploadFile>(async (blob, filename) => {
    const file = new File([blob], filename)
    const web3Storage = new Web3Storage({
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyMDIwODZmRjU5OUU0Y0YyMzM4MkUzNjg1Y0NmZUEyOGNBODBCOTAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTIzNjM1Njk3NDUsIm5hbWUiOiJVbmlkYXRhIn0.XmsAuXvbTj4BFhZlJK4xXfbd0ltVZJCEhqdYcW_kLOo",
    } as any)
    const cid = await web3Storage.put([file], {
      name: file.name,
      maxRetries: 3,
      wrapWithDirectory: false,
    })
    return {
      key: `${IPFS_GATEWAY}${cid}`,
    }
  }, [])

  return uploadFile
}

export type UploadFile = (
  blob: Blob,
  filename: string,
) => Promise<{ key: string }>
