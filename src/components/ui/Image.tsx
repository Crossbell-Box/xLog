"use client"

import { ImageProps, default as NextImage } from "next/image"
import React, { useEffect, useState } from "react"

import { Box, CircularProgress } from "@mui/material" // MUI components

import { useGetState } from "~/hooks/useGetState"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { IPFS_GATEWAY } from "~/lib/env"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"

export type TImageProps = {
  className?: string
  src?: string
  width?: number | string
  height?: number | string
  "original-src"?: string
  imageRef?: React.MutableRefObject<HTMLImageElement>
  zoom?: boolean
  blurDataURL?: string
  placeholder?: "blur"
} & React.HTMLAttributes<HTMLImageElement> &
  ImageProps

export const Image = ({
  fill,
  className,
  alt,
  src,
  width,
  height,
  imageRef,
  zoom,
  blurDataURL,
  placeholder,
  ...props
}: TImageProps) => {
  src = toIPFS(src)
  const [paddingTop, setPaddingTop] = React.useState("0")
  const [autoWidth, setAutoWidth] = React.useState(0)
  const [loading, setLoading] = useState(true)
  const noOptimization = className?.includes("no-optimization")
  const imageRefInternal = React.useRef<HTMLImageElement>(null)

  const isMobileLayout = useIsMobileLayout()
  const getSrc = useGetState(src)

  useEffect(() => {
    if (!imageRef) return
    if (!imageRefInternal.current) return

    if (typeof imageRef === "object") {
      imageRef.current = imageRefInternal.current
    }
  }, [imageRef])

  useEffect(() => {
    const $image = imageRefInternal.current
    if (!$image) return
    if (zoom) {
      if (isMobileLayout !== undefined) {
        if (isMobileLayout) {
          const clickHandler = () => {
            window.open(toGateway(getSrc()), "_blank")
          }
          $image.addEventListener("click", clickHandler)
          return () => {
            $image.removeEventListener("click", clickHandler)
          }
        } else {
          import("medium-zoom").then(({ default: mediumZoom }) => {
            mediumZoom($image, {
              margin: 10,
              background: "rgb(var(--tw-color-white))",
              scrollOffset: 0,
            })
          })
        }
      }
    }
  }, [zoom, isMobileLayout])

  if (!src) {
    return null
  }

  if (!src.startsWith("/assets/")) {
    try {
      new URL(src)
    } catch (error) {
      return null
    }
  }

  if (!noOptimization) {
    if (width) {
      width = +width
    }
    if (height) {
      height = +height
    }
  }

  const autoSize = !width && !height && !fill

  return (
    <Box
      className="inline-flex justify-center size-full overflow-hidden"
      sx={{
        maxWidth: autoSize ? `${autoWidth}px` : "none",
      }}
    >
      <Box
        className="inline-flex justify-center relative size-full"
        sx={autoSize ? { paddingTop } : {}}
      >
        {loading && (
          <CircularProgress
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
        <NextImage
          {...props}
          src={toGateway(src)}
          className={className}
          alt={alt}
          width={width}
          height={height}
          fill={fill || autoSize}
          blurDataURL={blurDataURL}
          placeholder={placeholder}
          onLoad={({ target }) => {
            if (autoSize) {
              const { naturalWidth, naturalHeight } = target as HTMLImageElement
              setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`)
              setAutoWidth(naturalWidth)
            }
            setLoading(false) // Stop loading spinner once the image is loaded
          }}
          ref={imageRefInternal}
          loader={
            src.startsWith("ipfs://") &&
            IPFS_GATEWAY === "https://ipfs.crossbell.io/ipfs/"
              ? ({ src, width, quality }) => {
                  try {
                    const urlObj = new URL(src)
                    urlObj.searchParams.set("img-quality", (quality || 75) + "")
                    urlObj.searchParams.set("img-format", "auto")
                    urlObj.searchParams.set("img-onerror", "redirect")
                    if (width) {
                      urlObj.searchParams.set("img-width", width + "")
                    }
                    return urlObj.toString()
                  } catch (error) {
                    return src
                  }
                }
              : undefined
          }
        />
      </Box>
    </Box>
  )
}
