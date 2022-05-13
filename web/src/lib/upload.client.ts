export const uploadFileInBrowser = async (blob: Blob) => {
  const form = new FormData()
  form.append("file", blob)
  form.append("type", "image")
  const res = await fetch(`/api/upload`, {
    credentials: "same-origin",
    body: form,
    method: "POST",
  })
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`)
  }
  const json = await res.json()
  return json as { file: string }
}
