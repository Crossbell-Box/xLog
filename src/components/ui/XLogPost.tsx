"use client"

import { useLocale } from "next-intl"
import React, { FC, useCallback, useState } from "react"

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material"

import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { Loading } from "../common/Loading"
import { Time } from "../common/Time"
import { Avatar } from "./Avatar"
import { UniLink } from "./UniLink"

interface Props {
  slug: string
  handle: string
  url: string
}

const XLogPost: FC<Props> = ({ slug, handle, url }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const locale = useLocale()
  const site = useGetSite(handle)
  const page = useGetPage({
    characterId: site.data?.characterId,
    slug,
    handle,
    disableAutofill: true,
    translateTo: locale,
  })

  const isMobile = window.innerWidth <= 768
  const images = page.data?.metadata.content.images || []
  const isShort = !!page.data?.metadata?.content?.tags?.includes("short")

  const preventNavigate = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation()
      e.preventDefault()
    },
    [],
  )

  const toggleExpand = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      preventNavigate(e)
      setIsExpanded((prev) => !prev)
    },
    [preventNavigate],
  )

  if (page.isLoading) return <Loading />

  return (
    <UniLink href={url} className="!no-underline !text-inherit">
      <Card
        sx={{
          display: "flex",
          flexDirection: isExpanded ? "column" : "row",
          gap: 2,
          my: 2,
          p: 2,
          boxShadow: 2,
          borderRadius: 2,
        }}
      >
        <Box
          onClick={preventNavigate}
          sx={{
            width: isExpanded ? "100%" : "150px",
            height: isExpanded ? "auto" : "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CardMedia
            component="img"
            alt={page.data?.metadata?.content?.title}
            image={images[0] || "/default-image.png"}
            sx={{
              borderRadius: 1,
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        </Box>

        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", lineClamp: 1 }}
          >
            {page.data?.metadata?.content?.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: isExpanded || isMobile ? 6 : 1,
            }}
          >
            {isShort
              ? page.data?.metadata?.content?.content
              : page.data?.metadata?.content?.summary}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Time isoString={page.data?.metadata?.content?.date_published} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                cid={site.data?.characterId}
                images={site.data?.metadata?.content?.avatars || []}
                name={site.data?.metadata?.content?.name}
                size={32}
              />
              <Box sx={{ ml: 1, flexDirection: "column" }}>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {site.data?.metadata?.content?.name}
                </Typography>
                {site.data?.handle && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {"@" + site.data?.handle}
                  </Typography>
                )}
              </Box>
              <Button
                sx={{
                  ml: 1,
                  minWidth: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "transparent",
                  color: "text.primary",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={toggleExpand}
              >
                <i
                  className={`i-mingcute-arrows-down-line text-xl ${isExpanded ? "rotate-180" : ""}`}
                />
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </UniLink>
  )
}

export default XLogPost
