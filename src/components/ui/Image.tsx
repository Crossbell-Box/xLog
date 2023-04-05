import React from "react"
import { default as NextImage, ImageProps } from "next/image"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"

export const Image: React.FC<
  {
    className?: string
    src?: string
    width?: number | string
    height?: number | string
    "original-src"?: string
    imageRef?: React.Ref<HTMLImageElement>
  } & React.HTMLAttributes<HTMLImageElement> &
    ImageProps
> = ({ fill, className, alt, src, width, height, imageRef, ...props }) => {
  src = toIPFS(src)
  const [paddingTop, setPaddingTop] = React.useState("0")
  const [autoWidth, setAutoWidth] = React.useState(0)
  const autoSize = !width && !height && !fill
  const noOptimization = className?.includes("no-optimization")

  if (!src.startsWith("/assets/")) {
    try {
      new URL(src)
    } catch (error) {
      return null
    }
  }

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
      ref={imageRef}
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
          ref={imageRef}
        />
      </span>
    </span>
  )
}
