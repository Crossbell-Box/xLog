import { memo } from "react"

import { Box } from "@mui/material" // MUI Box for layout

import FadeIn from "~/components/common/FadeIn"
import { Image, type TImageProps } from "~/components/ui/Image"
import { SITE_URL } from "~/lib/env"
import { cn, isServerSide } from "~/lib/utils"

const AdvancedImage = memo(async function AdvancedImage(props: TImageProps) {
  let info: {
    size: {
      width: number
      height: number
    }
    base64: string
  } | null = null

  if (props.src?.startsWith("http")) {
    try {
      info = await (
        await fetch(`${SITE_URL}/api/image?url=${props.src}`)
      ).json()
    } catch (error) {}
  }

  const autoProps = info?.base64
    ? {
        width: info.size?.width,
        height: info.size?.height,
        blurDataURL: info.base64,
        placeholder: "blur" as const,
      }
    : {}

  return (
    <FadeIn className="text-center">
      <Box
        sx={{
          display: "inline-block",
          borderRadius: info && info.size.height < 50 ? "none" : "16px", // Rounded corners with MUI styling
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <Image
          {...autoProps}
          {...props}
          zoom
          className={cn(
            props.className,
            info && info.size.height < 50 ? "" : "rounded-xl",
          )}
          alt={props.alt || "image"}
        />
      </Box>
    </FadeIn>
  )
})

export default isServerSide() ? AdvancedImage : Image
