"use client"

import React, { memo } from "react"

import { Card, CardContent, Link, Skeleton, Typography } from "@mui/material" // MUI components

import { getSiteLink } from "~/lib/helpers"
import { useGetSite } from "~/queries/site"

import { CharacterFloatCard } from "../common/CharacterFloatCard"

// Helper function to extract site ID
const getSiteId = ({ id, children }: { id: string; children?: any }) => {
  if (children && typeof children === "string" && children.startsWith("@")) {
    return children.replace(/^@/, "")
  } else if (id) {
    return id.replace(/^user-content-/, "")
  }
}

// Mention component
const Mention = memo(
  function Mention({ id, children }: { id: string; children?: any }) {
    let siteId = getSiteId({ id, children })

    const site = useGetSite(siteId)

    if (siteId && site.data) {
      return (
        <CharacterFloatCard siteId={siteId}>
          <Card variant="outlined" sx={{ maxWidth: 240 }}>
            <CardContent>
              <Link
                href={getSiteLink({
                  subdomain: siteId,
                })}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="primary"
              >
                <Typography variant="h6">@{siteId}</Typography>
              </Link>
            </CardContent>
          </Card>
        </CharacterFloatCard>
      )
    } else {
      return <Skeleton variant="text" width={120} height={30} /> // Show skeleton loading if site is not available
    }
  },
  (prevProps, nextProps) => {
    return getSiteId(prevProps) === getSiteId(nextProps) // Memoization based on siteId
  },
)

export default Mention
