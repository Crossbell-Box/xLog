import { useTranslations } from "next-intl"
import React, {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react"

import { XMarkIcon } from "@heroicons/react/20/solid"

import { Image } from "~/components/ui/Image"
import { useUploadFile } from "~/hooks/useUploadFile"
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
    disablePreview,
    enableGlobalEvents,
    ...inputProps
  }: {
    className?: string
    image?: string
    uploadStart?: () => void
    hasClose?: boolean
    accept?: string
    disablePreview?: boolean
    enableGlobalEvents?: boolean
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
  const t = useTranslations()

  const handleFile = useCallback(
    async (file?: File) => {
      if (file) {
        if (!disablePreview) {
          getBase64(file, (url) => {
            setImageUrl(url)
          })
        }

        setLoading(true)
        uploadStart?.()
        const key = (await uploadFile(file)).key
        if (withMimeType) {
          uploadEnd?.({
            address: key,
            mime_type: file.type,
          })
        } else {
          uploadEnd?.(key)
        }
        setLoading(false)
      }
    },
    [disablePreview, uploadEnd, uploadFile, uploadStart, withMimeType],
  )

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0])
  }

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (event.clipboardData?.items) {
        let items = event.clipboardData.items
        let blob = null
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            blob = items[i].getAsFile()
            break
          }
        }
        if (blob !== null) {
          handleFile(blob)
        }
      }
    },
    [handleFile],
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      let files = e.dataTransfer?.files
      if (
        files &&
        files.length === 1 &&
        files[0].type.indexOf("image") !== -1
      ) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  useEffect(() => {
    if (enableGlobalEvents) {
      document.addEventListener("paste", handlePaste)
      document.addEventListener("drop", handleDrop)

      return () => {
        document.removeEventListener("paste", handlePaste)
        document.removeEventListener("drop", handleDrop)
      }
    }
  }, [handleDrop, handlePaste, enableGlobalEvents])

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
            className="max-w-screen-md mx-auto object-cover size-full"
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
        <div className="size-full flex justify-center items-center text-zinc-500 text-center bg-white">
          {t("Click to select files")}
        </div>
      )}
      <input
        onChange={handleChange}
        type="file"
        className="absolute inset-0 opacity-0"
        accept={accept}
      />
      {imageUrl && hasClose && (
        <div
          onClick={clear}
          className="size-8 absolute top-4 right-4 shadow bg-white rounded-full cursor-pointer"
        >
          <XMarkIcon />
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-500 opacity-50">
          <div className="loading flex justify-center items-center relative text-white"></div>
        </div>
      )}
    </div>
  )
})
