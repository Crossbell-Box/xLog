import clsx from "clsx"
import React, { ChangeEvent, forwardRef, useEffect } from "react"
import { useState } from "react"
import { useUploadFile } from "~/hooks/useUploadFile"
import { toGateway } from "~/lib/ipfs-parser"
import { Image } from "~/components/ui/Image"
import { XMarkIcon } from "@heroicons/react/20/solid"

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
    withMimeType,
    hasClose,
    ...inputProps
  }: {
    className?: string
    image?: string
    uploadStart?: () => void
    uploadEnd?: (
      key:
        | string
        | {
            address?: string
            mime_type?: string
          },
    ) => void
    withMimeType?: boolean
    hasClose?: boolean
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
      uploadEnd?.(
        withMimeType
          ? {
              address: key,
              mime_type: event.target.files[0].type,
            }
          : key,
      )
      setLoading(false)
    } else if (event.target.value) {
      setImageUrl(event.target.value)
    }
  }

  const clear = () => {
    setImageUrl(undefined)
    uploadEnd?.(withMimeType ? {} : "")
  }

  useEffect(() => {
    if (!imageUrl) {
      setImageUrl(
        ((withMimeType
          ? (inputProps.value as any)?.address
          : inputProps.value) as string) || "",
      )
    }
  }, [inputProps.value])

  return (
    <div
      className={clsx(
        "relative flex-col overflow-hidden border border-gray-100",
        className,
      )}
    >
      <input
        {...(withMimeType
          ? {
              value: (inputProps.value as any)?.address,
              ...inputProps,
            }
          : inputProps)}
        onChange={handleChange}
        className="hidden"
      />
      {imageUrl && !withMimeType && (
        <Image
          className="mx-auto object-cover"
          src={toGateway(imageUrl)}
          alt="banner"
          fill
        />
      )}
      {imageUrl &&
        withMimeType &&
        (inputProps.value as any)?.mime_type.split("/")[0] === "image" && (
          <Image
            className="mx-auto object-cover"
            src={toGateway(imageUrl)}
            alt="banner"
            fill
          />
        )}
      {imageUrl &&
        withMimeType &&
        (inputProps.value as any)?.mime_type.split("/")[0] === "video" && (
          <video
            className="max-w-screen-md mx-auto object-cover h-full w-full"
            src={toGateway(imageUrl)}
            autoPlay
            muted
            playsInline
          />
        )}
      {!imageUrl && (
        <div className="w-full h-full flex justify-center items-center text-zinc-500 text-center">
          Click to select files
        </div>
      )}
      <input
        onChange={handleChange}
        type="file"
        className="absolute top-0 bottom-0 left-0 right-0 opacity-0"
      />
      {imageUrl && hasClose && (
        <div
          onClick={clear}
          className="w-8 h-8 absolute top-4 right-4 shadow bg-white rounded-full cursor-pointer"
        >
          <XMarkIcon />
        </div>
      )}
      {loading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-gray-500 opacity-50">
          <div className="loading flex justify-center items-center relative text-white"></div>
        </div>
      )}
    </div>
  )
})
