import React, { useMemo } from "react"

import { Image } from "~/components/ui/Image"
import { getRandomAvatarUrl } from "~/lib/helpers"
import { toGateway } from "~/lib/ipfs-parser"
import { cn } from "~/lib/utils"

export const Avatar = ({
  cid,
  images,
  size,
  name,
  className,
  rounded,
  imageRef,
  priority,
  ...props
}: {
  cid?: string | number | null
  images: (string | null | undefined)[]
  name?: string | null
  size?: number
  rounded?: boolean
  imageRef?: React.MutableRefObject<HTMLImageElement>
  className?: string
  priority?: boolean
} & React.HTMLAttributes<HTMLSpanElement>) => {
  size = size || 60

  let image = useMemo(() => {
    for (const image of images) {
      if (image) return toGateway(image)
    }
  }, [images])

  const borderRadius = rounded === false ? "rounded-lg" : "rounded-full"

  if (!image) {
    image = getRandomAvatarUrl(cid || "")
  }

  return (
    <span
      {...props}
      className={cn(
        `inline-flex text-zinc-500 shrink-0 items-center justify-center font-medium uppercase overflow-hidden text-[0px] max-w-full max-h-full`,
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
