"use client"

import React, { useState } from "react"

import { Image } from "~/components/ui/Image"
import { IPFS_GATEWAY } from "~/lib/env"

export const UniMedia = ({
  src,
  mime_type,
}: {
  src: string
  mime_type?: string
}) => {
  const [errorHandled, setErrorHandled] = useState(false)

  const [type, setType] = useState(mime_type)

  const handleError = async (e: any) => {
    const src = e.target.getAttribute("original-src")
    if (src && !errorHandled) {
      try {
        const response = await fetch(
          src.replace(IPFS_GATEWAY, "https://gateway.ipfs.io/ipfs/"),
          {
            method: "HEAD",
          },
        )
        setType(response.headers.get("content-type") ?? "")
        setErrorHandled(true)
      } catch (error) {}
    }
  }

  return (
    <div className="w-full aspect-[1] relative rounded overflow-hidden">
      <div className="absolute top-0 bottom-0 left-0 right-0">
        {(() => {
          switch (type?.split("/")[0]) {
            case "video":
              return (
                <video
                  className="w-full h-full"
                  src={src}
                  autoPlay
                  loop
                  muted
                />
              )
            case "model":
              return (
                // @ts-ignore
                <model-viewer
                  class="w-full h-full"
                  src={src}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  seamless-poster
                  shadow-intensity="1"
                  camera-controls
                  enable-pan
                />
              )
            case "text":
              return <iframe className="w-full h-full" src={src}></iframe>
            default:
              return (
                <Image
                  className="object-cover"
                  alt={"nft"}
                  src={src}
                  original-src={src}
                  fill={true}
                  onError={handleError}
                />
              )
          }
        })()}
      </div>
    </div>
  )
}
