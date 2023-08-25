import React, { ChangeEvent, forwardRef, useEffect, useState } from "react"

import { XMarkIcon } from "@heroicons/react/20/solid"

import { Image } from "~/components/ui/Image"
import { useUploadFile } from "~/hooks/useUploadFile"
import { useTranslation } from "~/lib/i18n/client"
import { toGateway } from "~/lib/ipfs-parser"
import { cn } from "~/lib/utils"

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
    accept,
    ...inputProps
  }: {
    className?: string
    image?: string
    uploadStart?: () => void
    hasClose?: boolean
    accept?: string
  } & (
    | {
        withMimeType?: false
        value?: string
        uploadEnd?: (key?: string) => void
      }
    | {
        withMimeType: true
        value?: {
          address?: string
          mime_type?: string
        }
        uploadEnd?: (key?: { address: string; mime_type: string }) => void
      }
  ) &
    Omit<React.ComponentPropsWithRef<"input">, "value">,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const uploadFile = useUploadFile()
  const [imageUrl, setImageUrl] = useState<string>()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation("common")

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      getBase64(event.target.files[0], (url) => {
        setImageUrl(url)
      })

      setLoading(true)
      uploadStart?.()
      const key = (await uploadFile(event.target.files[0])).key
      if (withMimeType) {
        uploadEnd?.({
          address: key,
          mime_type: event.target.files[0].type,
        })
      } else {
        uploadEnd?.(key)
      }
      setLoading(false)
    }
  }

  const clear = () => {
    setImageUrl(undefined)
    uploadEnd?.(undefined)
  }

  useEffect(() => {
    if (!imageUrl) {
      if (typeof inputProps.value === "object") {
        setImageUrl(inputProps.value.address)
      } else {
        setImageUrl(inputProps.value)
      }
    }
  }, [inputProps.value])

  return (
    <div
      className={cn(
        "relative flex-col overflow-hidden border border-gray-100",
        className,
      )}
    >
      {imageUrl &&
        (typeof inputProps.value === "object" &&
        inputProps.value.mime_type?.split("/")[0] === "video" ? (
          <video
            className="max-w-screen-md mx-auto object-cover h-full w-full"
            src={toGateway(imageUrl)}
            autoPlay
            muted
            playsInline
          />
        ) : (
          <Image
            className="mx-auto object-cover"
            src={toGateway(imageUrl)}
            alt="banner"
            fill
          />
        ))}
      {!imageUrl && (
        <div className="w-full h-full flex justify-center items-center text-zinc-500 text-center bg-white">
          {t("Click to select files")}
        </div>
      )}
      <input
        onChange={handleChange}
        type="file"
        className="absolute top-0 bottom-0 left-0 right-0 opacity-0"
        accept={accept}
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
