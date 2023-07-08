import React, { useMemo } from "react"

import { Image } from "~/components/ui/Image"
import { toGateway } from "~/lib/ipfs-parser"
import { cn } from "~/lib/utils"

export const Avatar = ({
  images,
  size,
  name,
  className,
  rounded,
  imageRef,
  priority,
  ...props
}: {
  images: (string | null | undefined)[]
  name?: string | null
  size?: number
  rounded?: boolean
  imageRef?: React.MutableRefObject<HTMLImageElement>
  className?: string
  priority?: boolean
} & React.HTMLAttributes<HTMLSpanElement>) => {
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
          `inline-flex text-white bg-gray-400 items-center justify-center text-xl font-medium uppercase flex-shrink-0 max-w-full max-h-full`,
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
        `inline-flex text-zinc-500 flex-shrink-0 items-center justify-center text-xl font-medium uppercase overflow-hidden text-[0px] max-w-full max-h-full`,
        borderRadius,
        className,
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <Image
        className="h-full overflow-hidden object-cover"
        src={image}
        width={size}
        height={size}
        alt={name || ""}
        imageRef={imageRef}
        priority={priority}
      />
    </span>
  )
}
