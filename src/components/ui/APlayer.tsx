"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { memo } from "react"

import { Box, IconButton, Tooltip, Typography } from "@mui/material" // Importing Tooltip from MUI

import {
  sitePlayerAddToPlaylist,
  sitePlayerPlayNow,
} from "~/components/common/SitePlayer"
// MUI imports
import { toGateway } from "~/lib/ipfs-parser"

const APlayer = memo(function APlayer({
  src,
  name,
  artist,
  cover,
  lrc,
  muted,
  autoPlay,
  loop,
}: {
  name?: string
  artist?: string
  cover?: string
  lrc?: string
} & React.AudioHTMLAttributes<HTMLAudioElement>) {
  const t = useTranslations()

  if (!src) return null

  src = toGateway(src)
  if (cover) {
    cover = toGateway(cover)
  }
  if (name) {
    name = name.replace(/^user-content-/, "")
  }

  const audioInfo = {
    name: name || "xLog audio",
    artist: artist || "",
    cover: cover || "/assets/logo.png",
    lrc,
    url: src,
  }

  const addToList = () => {
    sitePlayerAddToPlaylist(audioInfo)
  }

  const playNow = () => {
    sitePlayerPlayNow(audioInfo)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        border: "1px solid",
        borderColor: "var(--border-color)",
        borderRadius: "8px",
        outline: "2px solid transparent",
        alignItems: "center",
      }}
    >
      {/* Info Section */}
      <Box sx={{ display: "flex", gap: 2, flexGrow: 1, alignItems: "center" }}>
        {/* Cover Image */}
        <Box sx={{ flexShrink: 0 }}>
          <Image
            width={72}
            height={72}
            alt={audioInfo.name}
            src={audioInfo.cover}
            className="rounded-l-lg"
          />
        </Box>

        {/* Name & Artist */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Name */}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {audioInfo.name}
          </Typography>

          {/* Artist */}
          <Typography variant="body2" color="textSecondary">
            {audioInfo.artist}
          </Typography>
        </Box>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mr: 2 }}>
        {/* Play Now Button */}
        <Tooltip title={t("Play")} arrow>
          <IconButton
            onClick={playNow}
            sx={{
              bgcolor: "accent.main",
              "&:hover": { bgcolor: "accent.dark" },
            }}
          >
            <i className="i-mingcute-play-fill text-white text-4xl" />
          </IconButton>
        </Tooltip>

        {/* Add to Playlist Button */}
        <Tooltip title={t("Add to playlist")} arrow>
          <IconButton
            onClick={addToList}
            sx={{ bgcolor: "grey.50", "&:hover": { bgcolor: "grey.100" } }}
          >
            <i className="i-mingcute-calendar-add-line text-2xl" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
})

export default APlayer
