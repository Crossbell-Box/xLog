"use client"

import { ImageProps, default as NextImage } from "next/image"
import React, { useEffect } from "react"

import { useGetState } from "~/hooks/useGetState"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"

type TImageProps = {
  className?: string
  src?: string
  width?: number | string
  height?: number | string
  "original-src"?: string
  imageRef?: React.MutableRefObject<HTMLImageElement>
  zoom?: boolean
} & React.HTMLAttributes<HTMLImageElement> &
  ImageProps

export const Image: React.FC<TImageProps> = ({
  fill,
  className,
  alt,
  src,
  width,
  height,
  imageRef,
  zoom,
  ...props
}) => {
  src = toIPFS(src)
  const [paddingTop, setPaddingTop] = React.useState("0")
  const [autoWidth, setAutoWidth] = React.useState(0)
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

  return noOptimization ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={toGateway(src)}
      className={className}
      alt={alt}
      width={width}
      height={height}
      onLoad={({ target }) => {
        if (autoSize) {
          const { naturalWidth, naturalHeight } = target as HTMLImageElement
          setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`)
          setAutoWidth(naturalWidth)
        }
      }}
      ref={imageRefInternal}
    />
  ) : (
    <span
      className="inline-block w-full h-full overflow-hidden"
      style={
        autoSize
          ? {
              maxWidth: `${autoWidth}px`,
            }
          : {}
      }
    >
      <span
        className="inline-flex justify-center relative w-full h-full"
        style={autoSize ? { paddingTop } : {}}
      >
        <NextImage
          {...props}
          src={toGateway(src)}
          className={className}
          alt={alt}
          width={width}
          height={height}
          fill={fill || autoSize}
          onLoad={({ target }) => {
            if (autoSize) {
              const { naturalWidth, naturalHeight } = target as HTMLImageElement
              setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`)
              setAutoWidth(naturalWidth)
            }
          }}
          ref={imageRefInternal}
        />
      </span>
    </span>
  )
}

const ZoomedImage: React.FC<TImageProps> = (props) => {
  return (
    <span className="text-center block">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image {...props} zoom />
    </span>
  )
}

export default ZoomedImage
