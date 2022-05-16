import { useCallback } from "react"
import { R2_URL } from "~/lib/env"
import { useSignedJwt } from "./useSignedJwt"

export const useUploadFile = () => {
  const signedJwt = useSignedJwt()

  const uploadFile = useCallback<UploadFile>(
    async (blob, filename) => {
      if (!signedJwt) {
        throw new Error("failed to retrieve signed jwt, please try again")
      }

      const form = new FormData()
      form.append("file", blob, filename)
      const res = await fetch(R2_URL, {
        body: form,
        method: "post",
        headers: {
          authorization: `Bearer ${signedJwt}`,
        },
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const data = await res.json()
      return data
    },
    [signedJwt]
  )

  return uploadFile
}

export type UploadFile = (
  blob: Blob,
  filename: string
) => Promise<{ key: string }>
