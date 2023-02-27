import { cn } from "~/lib/utils"
import React, { useMemo } from "react"
import { toGateway } from "~/lib/ipfs-parser"
import { Image } from "~/components/ui/Image"

export const Avatar: React.FC<
  {
    images: (string | null | undefined)[]
    name?: string | null
    size?: number
    rounded?: boolean
    imageRef?: React.Ref<HTMLImageElement>
  } & React.HTMLAttributes<HTMLSpanElement>
> = ({ images, size, name, className, rounded, imageRef, ...props }) => {
  size = size || 60

  const fontSize = size * 0.5

  const nameAbbr = (name || "")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")

  const image = useMemo(() => {
    for (const image of images) {
      if (image) return toGateway(image)
    }
  }, [images])

  const borderRadius = rounded === false ? "rounded-lg" : "rounded-full"

  if (!image) {
    return (
      <span
        {...props}
        className={cn(
          `inline-flex text-white bg-gray-400 items-center justify-center text-xl font-medium uppercase flex-shrink-0`,
          borderRadius,
          className,
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${fontSize}px`,
        }}
      >
        {nameAbbr}
      </span>
    )
  }

  return (
    <span
      {...props}
      className={cn(
        `inline-flex text-zinc-500 flex-shrink-0 items-center justify-center text-xl font-medium uppercase overflow-hidden text-[0px]`,
        borderRadius,
        className,
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <Image
        className="overflow-hidden object-cover"
        src={image}
        width={size}
        height={size}
        alt={name || ""}
        imageRef={imageRef}
      />
    </span>
  )
}
