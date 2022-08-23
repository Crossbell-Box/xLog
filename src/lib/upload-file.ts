import axios from "axios"

export const UploadFile = async (blob: Blob) => {
  const formData = new FormData()
  formData.append("file", blob)

  const res = await axios.post(
    "https://ipfs-relay.crossbell.io/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  )
  return {
    key: res.data.url,
  }
}
