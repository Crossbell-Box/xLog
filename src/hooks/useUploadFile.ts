import { useCallback } from "react"
import { WEB3_STORAGE_API_TOKEN } from "~/lib/env"
import { Web3Storage } from 'web3.storage'

export const useUploadFile = () => {
  const uploadFile = useCallback<UploadFile>(
    async (blob, filename) => {
      const file = new File([blob], filename);
      const web3Storage = new Web3Storage({
          token: WEB3_STORAGE_API_TOKEN,
      } as any)
      const cid = await web3Storage.put([file], {
          name: file.name,
          maxRetries: 3,
          wrapWithDirectory: false,
      });
      return {
        key: `https://gateway.ipfs.io/ipfs/${cid}`
      }
    },
    []
  )

  return uploadFile
}

export type UploadFile = (
  blob: Blob,
  filename: string
) => Promise<{ key: string }>
