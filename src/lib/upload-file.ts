export const UploadFile = async (blob: Blob) => {
  const formData = new FormData()
  formData.append("file", blob)

  const response = await fetch(
    "https://ipfs-relay.crossbell.io/upload?gnfd=t",
    { method: "POST", body: formData },
  )
  return {
    key: (await response.json()).url,
  }
}
