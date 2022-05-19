import { useCallback } from "react"
import { R2_URL } from "~/lib/env"
import { trpc } from "~/lib/trpc"

export const useUploadFile = () => {
  const { fetchQuery } = trpc.useContext()

  const uploadFile = useCallback<UploadFile>(
    async (blob, filename) => {
      const jwt = await fetchQuery(["user.getSignedJwt"], {})

      const form = new FormData()
      form.append("file", blob, filename)
      const res = await fetch(R2_URL, {
        body: form,
        method: "post",
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const data = await res.json()
      return data
    },
    [fetchQuery]
  )

  return uploadFile
}

export type UploadFile = (
  blob: Blob,
  filename: string
) => Promise<{ key: string }>
