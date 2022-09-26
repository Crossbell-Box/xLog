import React from "react"
import { default as NextImage, ImageProps } from "next/image"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"
import { isIpfsUrl } from "@crossbell/ipfs-gateway"
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

  return (
    <>
      {isIpfsUrl(src) ? (
        <span
          className={clsx(
            "relative inline-flex justify-center",
            !width && !width && !layout ? "w-full h-full" : "",
          )}
          style={{ paddingTop }}
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
            layout={!width && !height ? "fill" : layout}
            onLoad={({ target }) => {
              if (!width && !width && !layout) {
                const { naturalWidth, naturalHeight } =
                  target as HTMLImageElement
                setPaddingTop(
                  `calc(100% / (${naturalWidth} / ${naturalHeight})`,
                )
              }
            }}
          />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...props}
          src={toGateway(src, {
            forceFallback: true,
          })}
          className={className}
          alt={alt}
        />
      )}
    </>
  )
}
