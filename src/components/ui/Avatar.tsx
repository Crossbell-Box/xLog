import React, { useMemo } from "react"

import { Box, Avatar as MuiAvatar } from "@mui/material" // MUI Avatar and Box for layout

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
  images: (string | null | undefined)[] // List of image URLs
  name?: string | null
  size?: number // Size of the avatar
  rounded?: boolean // Whether the avatar should be circular or not
  imageRef?: React.MutableRefObject<HTMLImageElement> // Reference for the image
  className?: string // Custom classes for additional styling
  priority?: boolean // Whether to load image with priority
} & React.HTMLAttributes<HTMLSpanElement>) => {
  size = size || 60 // Default size is 60 if not provided

  // Select the first valid image from the images list
  let image = useMemo(() => {
    for (const image of images) {
      if (image) return toGateway(image) // Convert the image to the gateway URL
    }
  }, [images])

  // If no image is found, use a random avatar
  const borderRadius = rounded === false ? "8px" : "50%" // Rounded or square avatar

  if (!image) {
    image = getRandomAvatarUrl(cid || "") // Default to a random avatar URL
  }

  return (
    <Box
      {...props}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden",
        className,
      )}
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: borderRadius,
        overflow: "hidden",
      }}
    >
      <MuiAvatar
        alt={name || "Avatar"}
        src={image}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "inherit", // Ensure the border radius applies to the image
        }}
        ref={imageRef}
        priority={priority}
      />
    </Box>
  )
}
