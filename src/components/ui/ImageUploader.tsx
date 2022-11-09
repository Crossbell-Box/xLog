import clsx from "clsx"
import React, { ChangeEvent, forwardRef, useEffect } from "react"
import { useState } from "react"
import { useUploadFile } from "~/hooks/useUploadFile"
import { toGateway } from "~/lib/ipfs-parser"

const getBase64 = (img: File, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener("load", () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

export const ImageUploader = forwardRef(function ImageUploader(
  {
    className,
    image,
    uploadStart,
    uploadEnd,
    ...inputProps
  }: {
    className?: string
    image?: string
    uploadStart?: () => void
    uploadEnd?: (key: string) => void
  } & React.ComponentPropsWithRef<"input">,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const uploadFile = useUploadFile()
  const [imageUrl, setImageUrl] = useState<string>()
  const [loading, setLoading] = useState(false)

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      getBase64(event.target.files[0], (url) => {
        setImageUrl(url)
      })

      setLoading(true)
      uploadStart?.()
      const key = (await uploadFile(event.target.files[0])).key
      uploadEnd?.(key)
      setLoading(false)
    } else if (event.target.value) {
      setImageUrl(event.target.value)
    }
  }
  useEffect(() => {
    if (!imageUrl) {
      setImageUrl((inputProps.value as string) || "")
    }
  }, [inputProps.value])

  return (
    <div
      className={clsx(
        "relative flex-col overflow-hidden bg-gray-400",
        className,
      )}
    >
      <input {...inputProps} onChange={handleChange} className="hidden" />
      {imageUrl && <img src={toGateway(imageUrl)} className="w-full h-full" />}
      <input
        onChange={handleChange}
        type="file"
        className="absolute top-0 bottom-0 left-0 right-0 opacity-0"
      />
      {loading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-gray-500 opacity-50">
          <div className="loading flex justify-center items-center relative text-white"></div>
        </div>
      )}
    </div>
  )
})
