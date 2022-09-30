import React from "react"
import { default as NextImage, ImageProps } from "next/image"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"
import clsx from "clsx"

export const Image: React.FC<
  {
    className?: string
    src?: string
    width?: number | string
    height?: number | string
  } & React.HTMLAttributes<HTMLImageElement> &
    ImageProps
> = ({ layout, className, alt, src, width, height, ...props }) => {
  src = toIPFS(src)
  const [paddingTop, setPaddingTop] = React.useState("0")
  const [autoWidth, setAutoWidth] = React.useState(0)
  const autoSize = !width && !height && !layout

  return (
    <span
      className="inline-block w-full h-full"
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
          src={toGateway(src, {
            forceFallback: true,
          })}
          className={className}
          alt={alt}
          width={width}
          height={height}
          layout={autoSize ? "fill" : layout}
          onLoad={({ target }) => {
            if (autoSize) {
              const { naturalWidth, naturalHeight } = target as HTMLImageElement
              setPaddingTop(`calc(100% / (${naturalWidth} / ${naturalHeight})`)
              setAutoWidth(naturalWidth)
            }
          }}
        />
      </span>
    </span>
  )
}
